import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { StoreService } from '@/services/store.service';
import { LogsService } from '@/services/logs.service';

export const maintenanceGuard: CanActivateFn = () => {

    const store = inject(StoreService);
    const router = inject(Router);
    const logger = inject(LogsService);

    const user =
        store.getCurrentUser();

    const maintenance =
        store.getBooleanSetting('ActivateMaintenance');


    logger.printLogs(
        'i',
        'Maintenance Check',
        {
            maintenance,
            user
        }
    );

    if (maintenance) {

        const isAdmin =
            user?.roleName === 'System Administrator' ||
            user?.roleID === 'UGR0001';

        if (!isAdmin) {

            logger.printLogs(
                'w',
                'Blocked by Maintenance Mode',
                user?.username
            );

            return router.createUrlTree(['/maintenance']);
        }

        logger.printLogs(
            'i',
            'Admin Bypass Maintenance',
            user?.username
        );
    }

    return true;
};