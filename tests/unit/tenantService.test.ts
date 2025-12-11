import { describe, it, expect, vi } from 'vitest';
import { tenantService } from '../../klyver-master/src/services/tenantService';
import { supabase } from '../../klyver-master/src/services/supabase';

// Mock Supabase
vi.mock('../../klyver-master/src/services/supabase', () => ({
    supabase: {
        functions: {
            invoke: vi.fn()
        },
        from: vi.fn(),
    }
}));

describe('Tenant Service (Master)', () => {
    it('should call Edge Function with correct payload', async () => {
        const formData = {
            fantasyName: 'Test Pharma',
            corporateName: 'Test Corp',
            cnpj: '12345678000199',
            phone: '11999999999',
            email: 'test@pharma.com',
            responsibleName: 'John Doe',
            planCode: 'pro',
            adminEmail: 'admin@pharma.com',
            adminName: 'Admin John'
        };

        const mockResponse = {
            data: {
                tenant: { id: '123', slug: 'test-pharma' },
                tempPassword: 'abc'
            },
            error: null
        };

        (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

        const result = await tenantService.create(formData);

        expect(supabase.functions.invoke).toHaveBeenCalledWith('create-tenant', {
            body: {
                tenant: formData,
                adminEmail: formData.adminEmail,
                adminName: formData.adminName
            }
        });

        expect(result.tenant.id).toBe('123');
        expect(result.tempPassword).toBe('abc');
    });

    it('should throw error if Edge Function fails', async () => {
        (supabase.functions.invoke as any).mockResolvedValue({
            data: null,
            error: { message: 'Edge Error' }
        });

        await expect(tenantService.create({} as any)).rejects.toThrow('Edge Error');
    });
});
