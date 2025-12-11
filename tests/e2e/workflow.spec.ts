import { test, expect } from '@playwright/test';

test.describe('Master -> Admin Flow', () => {

    test('Create Tenant and Login', async ({ page }) => {
        // 1. Visit Master
        await page.goto('http://localhost:5173');
        await page.getByPlaceholder('Email').fill('master@klyver.com');
        await page.getByPlaceholder('Senha').fill('master123');
        await page.click('button:has-text("Entrar")');

        // 2. Create Tenant
        await page.click('text=Nova Farmácia');
        await page.fill('input[name="fantasyName"]', 'E2E Pharma');
        await page.fill('input[name="adminEmail"]', 'e2e@pharma.com');
        await page.click('button:has-text("Criar Sistema")');

        // 3. Verify Success Modal & Copy Password
        await expect(page.locator('text=Farmácia criada com sucesso')).toBeVisible();
        const password = await page.locator('#temp-password').innerText();

        // 4. Visit Admin URL (Simulated)
        // In real E2E we might switch contexts or use the slug
        await page.goto('http://localhost:5174/login');

        // 5. Login as new admin
        await page.fill('input[type="email"]', 'e2e@pharma.com');
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Acessar Sistema")');

        // 6. Verify Dashboard
        await expect(page.locator('text=Visão Geral')).toBeVisible();
    });
});
