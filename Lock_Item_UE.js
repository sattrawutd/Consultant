/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @description ปิดฟิลด์ Item บน PO สำหรับ Role ที่ไม่ใช่ Admin(3)/Purchasing(1019) ไม่ให้กดเลือก Item อื่นได้
 */
define(['N/runtime', 'N/ui/serverWidget'], function(runtime, serverWidget) {

    const EXCLUDED_ROLE_IDS = [3, 1019]; // Admin = 3, Purchasing = 1019

    function beforeLoad(context) {
        // ทำงานเฉพาะตอน Create และ Edit
        if (context.type !== context.UserEventType.CREATE &&
            context.type !== context.UserEventType.EDIT) return;

        var user = runtime.getCurrentUser();
        // ถ้าเป็น Admin หรือ Purchasing ไม่ต้องทำอะไร (ใช้งานปกติ)
        if (EXCLUDED_ROLE_IDS.indexOf(user.role) !== -1) return;

        var form = context.form;
        var sublist = form.getSublist({ id: 'item' });
        var itemField = sublist.getField({ id: 'item' });

        // Disable ฟิลด์ Item → ไม่ให้กดเปิด dropdown / popup เลือก Item อื่นได้
        itemField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});
