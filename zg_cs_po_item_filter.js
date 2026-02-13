/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * @description     จำกัดให้เลือกได้เฉพาะ item ADVP-14001 (Internal ID: 718) ในหน้า Purchase Order
 *                  ยกเว้น role Administrator (3) และ Purchase_Manager_ZG (1019)
 *
 * @appliesTo       Purchase Order (purchaseorder)
 * @deployTo        Purchase Order
 */
define(['N/runtime'], function (runtime) {

    // ==================== Configuration ====================
    const ALLOWED_ITEM_ID = 718;                // Internal ID ของ item ADVP-14001
    const ALLOWED_ITEM_NAME = 'ADVP-14001';     // ชื่อ item สำหรับแสดงใน alert
    const EXCLUDED_ROLES = [3, 1019];           // Role IDs ที่ไม่ถูกจำกัด: Administrator, Purchase_Manager_ZG
    // =======================================================

    /**
     * ตรวจสอบว่า role ปัจจุบันถูกจำกัดหรือไม่
     * @returns {boolean} true = ถูกจำกัด (ต้อง filter item)
     */
    function isRoleRestricted() {
        const currentRole = runtime.getCurrentUser().role;
        return !EXCLUDED_ROLES.includes(currentRole);
    }

    /**
     * pageInit - ทำงานตอนเปิดหน้า PO
     */
    function pageInit(context) {
        // สามารถใช้ log เพื่อ debug ได้
        log.debug('pageInit', 'Role: ' + runtime.getCurrentUser().role + ' | Restricted: ' + isRoleRestricted());
    }

    /**
     * fieldChanged - ทำงานเมื่อ field ในหน้ามีการเปลี่ยนแปลง
     * ใช้ตรวจสอบทันทีเมื่อ user เลือก item ใน sublist
     */
    function fieldChanged(context) {
        if (!isRoleRestricted()) return;

        // ตรวจสอบเฉพาะ field 'item' ใน sublist 'item'
        if (context.sublistId === 'item' && context.fieldId === 'item') {
            const currentRecord = context.currentRecord;
            const selectedItemId = currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            });

            if (selectedItemId && Number(selectedItemId) !== ALLOWED_ITEM_ID) {
                // เคลียร์ item ที่เลือกออก
                currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: '',
                    ignoreFieldChange: true
                });

                alert('คุณสามารถเลือกได้เฉพาะ item: ' + ALLOWED_ITEM_NAME + ' เท่านั้น\n'
                    + 'You can only select item: ' + ALLOWED_ITEM_NAME);
            }
        }
    }

    /**
     * validateLine - ทำงานก่อนที่จะ add/update line ใน sublist
     * เป็น safety net เพื่อป้องกันการเพิ่ม item ที่ไม่อนุญาต
     */
    function validateLine(context) {
        if (!isRoleRestricted()) return true;

        if (context.sublistId === 'item') {
            const currentRecord = context.currentRecord;
            const selectedItemId = currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            });

            if (selectedItemId && Number(selectedItemId) !== ALLOWED_ITEM_ID) {
                alert('ไม่สามารถเพิ่ม item นี้ได้ อนุญาตเฉพาะ item: ' + ALLOWED_ITEM_NAME + '\n'
                    + 'Cannot add this item. Only item: ' + ALLOWED_ITEM_NAME + ' is allowed.');
                return false;
            }
        }
        return true;
    }

    /**
     * saveRecord - ตรวจสอบก่อน save ว่าทุก line เป็น item ที่อนุญาตเท่านั้น
     */
    function saveRecord(context) {
        if (!isRoleRestricted()) return true;

        const currentRecord = context.currentRecord;
        const lineCount = currentRecord.getLineCount({ sublistId: 'item' });

        for (let i = 0; i < lineCount; i++) {
            const itemId = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            if (itemId && Number(itemId) !== ALLOWED_ITEM_ID) {
                alert('บรรทัดที่ ' + (i + 1) + ' มี item ที่ไม่อนุญาต\n'
                    + 'กรุณาลบออกหรือเปลี่ยนเป็น ' + ALLOWED_ITEM_NAME + '\n\n'
                    + 'Line ' + (i + 1) + ' contains a disallowed item.\n'
                    + 'Please remove it or change to ' + ALLOWED_ITEM_NAME);
                return false;
            }
        }
        return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        validateLine: validateLine,
        saveRecord: saveRecord
    };
});
