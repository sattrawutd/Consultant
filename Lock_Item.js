/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @description ตั้ง Item เป็น ID 718 อัตโนมัติบน PO สำหรับ Role ที่ไม่ใช่ Admin(3)/Purchasing(1019)
 *              ใช้คู่กับ Lock_Item_UE.js (User Event) ที่ปิดฟิลด์ Item ไม่ให้เลือกได้
 */
define(['N/runtime'], function(runtime) {

    // Item เดียวที่อนุญาต
    const ALLOWED_ITEM_ID = 718;

    // Role ที่ไม่บังคับ (เลือก Item อะไรก็ได้): Admin = 3, Purchasing = 1019
    const EXCLUDED_ROLE_IDS = [3, 1019];

    function isExcludedRole() {
        var user = runtime.getCurrentUser();
        return EXCLUDED_ROLE_IDS.indexOf(user.role) !== -1;
    }

    /**
     * pageInit - ไม่ต้องทำอะไรพิเศษตอน load
     */
    function pageInit(context) {
        // reserved
    }

    /**
     * lineInit - เมื่อเพิ่มบรรทัดใหม่หรือเลือกบรรทัดเดิม ตั้ง Item เป็น 718 อัตโนมัติ
     */
    function lineInit(context) {
        if (context.sublistId !== 'item') return;
        if (isExcludedRole()) return;

        var rec = context.currentRecord;
        var itemId = rec.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item'
        });

        // ถ้ายังไม่มี Item (บรรทัดใหม่) → ตั้งเป็น 718 อัตโนมัติ
        if (!itemId) {
            rec.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: ALLOWED_ITEM_ID,
                ignoreFieldChange: false // ให้ sourcing ทำงาน (ดึงราคา, description ฯลฯ)
            });
        }
    }

    /**
     * validateLine - Safety check: ถ้า Item ไม่ใช่ 718 ให้บังคับเป็น 718
     */
    function validateLine(context) {
        if (context.sublistId !== 'item') return true;
        if (isExcludedRole()) return true;

        var rec = context.currentRecord;
        var itemId = rec.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item'
        });

        if (itemId && Number(itemId) !== ALLOWED_ITEM_ID) {
            rec.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: ALLOWED_ITEM_ID,
                ignoreFieldChange: true
            });
        }
        return true;
    }

    return {
        pageInit: pageInit,
        lineInit: lineInit,
        validateLine: validateLine
    };
});