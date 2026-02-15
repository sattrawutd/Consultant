/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/log'], (record, log) => {

    const beforeLoad = (context) => {
        try {
            if (context.type !== context.UserEventType.VIEW && 
                context.type !== context.UserEventType.EDIT) return;

            const rec = context.newRecord;
            const lineCount = rec.getLineCount({ sublistId: 'purchaserequisition' });

            log.debug('Line Count', lineCount);

            for (let i = 0; i < lineCount; i++) {
                const estimatedRate = rec.getSublistValue({
                    sublistId: 'purchaserequisition',
                    fieldId: 'estimatedrate',
                    line: i
                });

                if (estimatedRate) {
                    rec.setSublistValue({
                        sublistId: 'purchaserequisition',
                        fieldId: 'orderrate',
                        line: i,
                        value: estimatedRate
                    });

                    log.debug('Line ' + i, 'Set Order Rate = ' + estimatedRate);
                }
            }
        } catch (e) {
            log.error('Error in beforeLoad', e.message);
        }
    };

    return { beforeLoad };
});