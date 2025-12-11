import { supabase } from './supabase';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface CMEDItem {
    product_name: string;
    presentation: string;
    manufacturer: string;
    active_ingredient: string;
    registration: string;
    class: string;
    price_pmc: number;
    price_pmvg: number;
    price_pf: number;
}

const API_1_URL = (import.meta as any).env.VITE_CMED_API_1_URL || 'https://api.bussoladoconsumidor.org/medicamentos';
const API_2_URL = (import.meta as any).env.VITE_CMED_API_2_URL || 'https://api.medapi.com.br/v1/medicamentos';
const API_KEY = (import.meta as any).env.VITE_CMED_API_KEY || '';

export async function searchCMED(query: string): Promise<CMEDItem[]> {
    if (!query || query.length < 3) return [];

    try {
        // 1. Check Cache (< 48 hours)
        const { data: cacheData } = await supabase
            .from('cmed_cache' as any)
            .select('response_json, created_at')
            .eq('query', query.toLowerCase())
            .single();

        if (cacheData) {
            const data: any = cacheData;
            const created = new Date(data.created_at);
            const now = new Date();
            const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

            if (diffHours < 48) {
                console.log('CMED: Returning cached data');
                return data.response_json as CMEDItem[];
            }
        }

        // 2. Try API 1 (Bússola)
        try {
            console.log('CMED: Trying API 1...');
            const results = await fetchFromAPI1(query);
            if (results.length > 0) {
                await saveToCache(query, results);
                return results;
            }
        } catch (e) {
            console.warn('CMED: API 1 failed', e);
        }

        // 3. Try API 2 (MedAPI - Fallback)
        try {
            console.log('CMED: Trying API 2...');
            const results = await fetchFromAPI2(query);
            if (results.length > 0) {
                await saveToCache(query, results);
                return results;
            }
        } catch (e) {
            console.warn('CMED: API 2 failed', e);
        }

        // 4. Fallback to Local Table (if APIs fail)
        console.log('CMED: Fallback to local table');
        const { data: officialData } = await supabase
            .from('cmed_prices' as any)
            .select('*')
            .ilike('drug_name', `%${query}%`)
            .limit(20);

        if (officialData && officialData.length > 0) {
            return officialData.map((item: any) => ({
                product_name: item.drug_name,
                presentation: item.presentation,
                manufacturer: item.laboratory,
                active_ingredient: item.active_ingredient,
                registration: item.registration_number,
                class: item.therapeutic_class || '',
                price_pmc: item.pmc_value,
                price_pmvg: item.pmvg_value,
                price_pf: item.pf_value
            }));
        }

        return [];

    } catch (error) {
        console.error('CMED Search Error:', error);
        return [];
    }
}

async function saveToCache(query: string, data: CMEDItem[]) {
    // Delete old cache for this query
    await supabase.from('cmed_cache' as any).delete().eq('query', query.toLowerCase());
    // Insert new
    await supabase.from('cmed_cache' as any).insert({
        query: query.toLowerCase(),
        response_json: data
    });
}

async function fetchFromAPI1(query: string): Promise<CMEDItem[]> {
    // Mock implementation if no real API key/url, or actual fetch
    // Note: The user provided URL might need CORS handling or proxy. 
    // Assuming direct call is possible or handled via proxy.

    // For demo purposes, if the URL is the placeholder, we might mock or try fetch.
    // Real implementation:
    const response = await fetch(`${API_1_URL}?nome=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('API 1 Error');
    const data = await response.json();

    // Map response to CMEDItem
    // Expected: { nome, pmc, pmvg, pf_com_imposto, pf_sem_imposto, registro, laboratorio, classe, apresentacao }
    // API might return array or single object
    const list = Array.isArray(data) ? data : [data];

    return list.map((item: any) => ({
        product_name: item.nome || item.product_name,
        presentation: item.apresentacao || item.presentation,
        manufacturer: item.laboratorio || item.manufacturer,
        active_ingredient: item.principio_ativo || item.active_ingredient || '',
        registration: item.registro || item.registration || '',
        class: item.classe || item.class || '',
        price_pmc: Number(item.pmc || item.price_pmc || 0),
        price_pmvg: Number(item.pmvg || item.price_pmvg || 0),
        price_pf: Number(item.pf_com_imposto || item.price_pf || 0)
    })).filter(i => i.product_name);
}

async function fetchFromAPI2(query: string): Promise<CMEDItem[]> {
    const response = await fetch(`${API_2_URL}?nome=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('API 2 Error');
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.results || []);

    return list.map((item: any) => ({
        product_name: item.nome,
        presentation: item.apresentacao,
        manufacturer: item.laboratorio,
        active_ingredient: item.principio_ativo,
        registration: item.registro,
        class: item.classe,
        price_pmc: Number(item.pmc),
        price_pmvg: Number(item.pmvg),
        price_pf: Number(item.pf)
    }));
}

// Function to import Data (CSV, Excel, PDF)
export async function importCMEDData(file: File): Promise<{ success: boolean; count: number; error?: string }> {
    return new Promise(async (resolve) => {
        try {
            let rows: any[] = [];

            if (file.name.endsWith('.csv')) {
                // Parse CSV
                const text = await readFileAsText(file);
                const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                rows = result.data;

            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                // Parse Excel
                const data = await readFileAsBinary(file);
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to JSON array of arrays to find header
                const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                // Find header row index
                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(rawData.length, 50); i++) {
                    const rowStr = JSON.stringify(rawData[i]).toLowerCase();
                    if (rowStr.includes('princípio ativo') || rowStr.includes('laboratório') || rowStr.includes('apresentação')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    // Fallback: Try to use default header
                    rows = XLSX.utils.sheet_to_json(sheet);
                } else {
                    // Use found header row
                    const headers = rawData[headerRowIndex];
                    // Create objects from subsequent rows
                    rows = rawData.slice(headerRowIndex + 1).map(row => {
                        const obj: any = {};
                        headers.forEach((header: any, index: number) => {
                            if (header) obj[header] = row[index];
                        });
                        return obj;
                    });
                }

            } else if (file.name.endsWith('.pdf')) {
                // Parse PDF (Experimental)
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                    // Very basic extraction - just counting pages for now or extracting raw text
                    // Real table extraction from PDF is extremely complex client-side
                    console.warn('PDF parsing is experimental and limited.');

                    // For now, we return an error explaining limitation, or we could try to parse text
                    // But CMED PDFs are complex tables.
                    throw new Error('Importação de PDF ainda não suporta a estrutura complexa da tabela CMED. Por favor, use o arquivo .XLS ou .CSV oficial para garantir a integridade dos dados.');

                } catch (e: any) {
                    throw new Error(e.message || 'Erro ao ler PDF.');
                }
            } else {
                throw new Error('Formato de arquivo não suportado. Use .csv, .xls ou .xlsx');
            }

            // Normalize and Filter Data
            const normalizedRows = rows.map((row: any) => {
                // Helper to find value by fuzzy key match
                const findVal = (keys: string[]) => {
                    for (const key of Object.keys(row)) {
                        const cleanKey = key.toLowerCase().trim();
                        if (keys.some(k => cleanKey.includes(k.toLowerCase()))) {
                            return row[key];
                        }
                    }
                    return null;
                };

                return {
                    drug_name: findVal(['produto', 'nome']) || row['PRODUTO'],
                    presentation: findVal(['apresentação', 'apresentacao']) || row['APRESENTAÇÃO'],
                    laboratory: findVal(['laboratório', 'laboratorio']) || row['LABORATÓRIO'],
                    registration_number: findVal(['registro']) || row['REGISTRO'],
                    pf_value: parsePrice(findVal(['pf 0%', 'pf sem impostos', 'pf 18%']) || row['PF Sem Impostos']),
                    pmc_value: parsePrice(findVal(['pmc 0%', 'pmc 12%', 'pmc 17%', 'pmc 18%', 'pmc 20%']) || row['PMC 0%']),
                    pmvg_value: parsePrice(findVal(['pmvg sem impostos', 'pmvg 0%']) || row['PMVG Sem Impostos']),
                    active_ingredient: findVal(['substância', 'substancia', 'princípio ativo']) || row['SUBSTÂNCIA'],
                    therapeutic_class: findVal(['classe terapêutica', 'classe terapeutica']) || row['CLASSE TERAPÊUTICA'],
                    last_update: new Date().toISOString()
                };
            }).filter((r: any) => r.drug_name && r.pmc_value > 0);

            if (normalizedRows.length === 0) {
                throw new Error('Nenhum dado válido encontrado no arquivo. Verifique se é a lista oficial da CMED.');
            }

            // Insert in batches
            const BATCH_SIZE = 1000;
            for (let i = 0; i < normalizedRows.length; i += BATCH_SIZE) {
                const batch = normalizedRows.slice(i, i + BATCH_SIZE);
                const { error } = await supabase.from('cmed_prices' as any).upsert(batch as any, { onConflict: 'registration_number' as any } as any);
                if (error) throw error;
            }

            resolve({ success: true, count: normalizedRows.length });

        } catch (err: any) {
            console.error('Import Error:', err);
            resolve({ success: false, count: 0, error: err.message });
        }
    });
}

// Helpers
function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function readFileAsBinary(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
}

function parsePrice(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        // Clean string (remove R$, spaces)
        let clean = value.trim().replace(/^R\$\s?/, '');

        // Handle Brazilian format "1.234,56" -> 1234.56
        if (clean.includes(',') && clean.includes('.')) {
            return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
        } else if (clean.includes(',')) {
            return parseFloat(clean.replace(',', '.'));
        }
        return parseFloat(clean);
    }
    return 0;
}
