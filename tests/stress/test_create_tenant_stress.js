/*
 * k6 Stress Test for Create Tenant
 * Expects to be run with k6: k6 run test_create_tenant_stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 },  // Stay at 20 users
        { duration: '30s', target: 0 },  // Ramp down
    ],
};

export default function () {
    const payload = JSON.stringify({
        tenant: {
            display_name: 'Stress Test Farm',
            slug: `stress-${__VU}-${__ITER}`,
        },
        adminEmail: `stress-${__VU}-${__ITER}@example.com`
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Note: This endpoint should be the deployed one
    const res = http.post('https://nezmauiwtoersiwtpjmd.supabase.co/functions/v1/create-tenant', payload, params);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'duration < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
