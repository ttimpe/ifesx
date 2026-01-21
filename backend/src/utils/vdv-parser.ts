/**
 * VDV 451/452 .x10 File Parser
 * Parses ASCII exchange format files according to VDV 451/452 specification
 */

export interface VdvParseResult {
    header: {
        source?: string;
        charset?: string;
        version?: string;
        mode?: string;
        date?: string;
        time?: string;
    };
    tableName: string;
    columns: string[];
    formats: string[];
    records: Record<string, any>[];
}

/**
 * Parse a VDV .x10 file content
 * @param content File content as string (should be decoded from ISO8859-1)
 * @returns Parsed VDV data structure
 */
export function parseVdvFile(content: string): VdvParseResult {
    const lines = content.split(/\r?\n/);

    const result: VdvParseResult = {
        header: {},
        tableName: '',
        columns: [],
        formats: [],
        records: []
    };

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Split by semicolon, preserving quoted strings
        const parts = parseSemicolonLine(trimmed);
        if (parts.length === 0) continue;

        const command = parts[0].toLowerCase();

        switch (command) {
            case 'mod':
                result.header.mode = parts[1] || '';
                result.header.date = parts[1] || '';
                result.header.time = parts[2] || '';
                break;
            case 'src':
                result.header.source = stripQuotes(parts[1] || '');
                break;
            case 'chs':
                result.header.charset = parts[1] || 'ISO8859-1';
                break;
            case 'ver':
                result.header.version = stripQuotes(parts[1] || '');
                break;
            case 'tbl':
                result.tableName = parts[1]?.toUpperCase() || '';
                break;
            case 'atr':
                // Column names (skip command itself)
                result.columns = parts.slice(1).map(c => c.trim());
                break;
            case 'frm':
                // Format definitions (skip command itself)
                result.formats = parts.slice(1).map(f => f.trim());
                break;
            case 'rec':
                // Data record
                if (result.columns.length > 0) {
                    const record: Record<string, any> = {};
                    for (let i = 0; i < result.columns.length; i++) {
                        const colName = result.columns[i];
                        const value = parts[i + 1] || '';
                        const format = result.formats[i] || '';
                        record[colName] = parseValue(value, format);
                    }
                    result.records.push(record);
                }
                break;
            case 'end':
                // End of table - we can validate record count if needed
                break;
            case 'eof':
                // End of file
                break;
            default:
                // Skip unknown commands (ifv, dve, fft, etc.)
                break;
        }
    }

    return result;
}

/**
 * Parse a semicolon-separated line, respecting quoted strings
 */
function parseSemicolonLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // Check for escaped quote (doubled)
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ';' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add last part
    if (current) {
        result.push(current.trim());
    }

    return result;
}

/**
 * Strip surrounding quotes from a string
 */
function stripQuotes(value: string): string {
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/""/g, '"');
    }
    return value;
}

/**
 * Parse a value according to its format definition
 * @param value Raw string value
 * @param format Format string (e.g., "num[9]", "char[40]")
 */
function parseValue(value: string, format: string): any {
    const stripped = stripQuotes(value);

    if (!format) return stripped;

    const formatLower = format.toLowerCase();

    if (formatLower.startsWith('num')) {
        // Numeric value
        const num = parseInt(stripped, 10);
        return isNaN(num) ? 0 : num;
    } else if (formatLower.startsWith('dec')) {
        // Decimal value
        const num = parseFloat(stripped.replace(',', '.'));
        return isNaN(num) ? 0 : num;
    } else {
        // String/char value
        return stripped;
    }
}

/**
 * Map VDV table name to Sequelize model name
 */
export function getModelNameForTable(tableName: string): string | null {
    const mapping: Record<string, string> = {
        'REC_ORT': 'RecOrt',
        'REC_HP': 'RecHp',
        'REC_LID': 'RecLid',
        'REC_FRT': 'RecFrt',
        'REC_SEL': 'RecSel',
        'REC_UEB': 'RecUeb',
        'REC_ZNR': 'RecZnr',
        'REC_UMLAUF': 'RecUmlauf',
        'REC_UMS': 'RecUms',
        'REC_OM': 'RecOm',
        'REC_ANR': 'RecAnr',
        'LID_VERLAUF': 'LidVerlauf',
        'UEB_FZT': 'UebFzt',
        'SEL_FZT_FELD': 'RecSelFztFeld',
        'MENGE_BEREICH': 'MengeBereich',
        'MENGE_FGR': 'MengeFgr',
        'MENGE_FAHRTART': 'MengeFahrtart',
        'MENGE_FZG_TYP': 'MengeFzgTyp',
        'MENGE_TAGESART': 'Tagesart',
        'MENGE_ONR_TYP': 'MengeOnrTyp',
        'MENGE_BASIS_VERSIONEN': 'BasisVersion',
        'EINZELANSCHLUSS': 'Einzelanschluss',
        'FAHRZEUG': 'Fahrzeug',
        'FIRMENKALENDER': 'Betriebstag'
    };

    return mapping[tableName.toUpperCase()] || null;
}
