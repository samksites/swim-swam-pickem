import { logLevels } from '../services/logger';




// Builds a batch SQL update query for multiple rows
// table: name of the table to update
// fieldNames: array of column names to update
// data: array of arrays, each inner array is a row of new values
// idFields: array of column names used for identifying rows (WHERE clause)
// idFieldsValues: array of arrays, each inner array is the id values for a row
const buildBatchUpdateQuery = (table: string, fieldNames: string[], data: any[][], idFields: string[], whereClauseValues: any[][]) => {

    var query = '';

    // Build an UPDATE statement for each row
    for (let i = 0; i < data.length; i++) {
        query += `UPDATE ${table} SET `;
        // Add assignments for each field
        for (let j = 0; j < fieldNames.length; j++) {
            query += `${fieldNames[j]} = '${data[i][j]}'`;
            if (j < fieldNames.length - 1) {
                query += ', ';
            }
        }
        // Build WHERE clause for identifying the row
        query += ' WHERE ';
        for (let k = 0; k < whereClauseValues[i].length; k += 2) {
            query += `${whereClauseValues[i][k]} = ${whereClauseValues[i][k + 1]}`;
            if (k < whereClauseValues[i].length - 2) {
                query += ' AND ';
            }
        }
        query += '; ';
    }

    // Log the built query for debugging
    logLevels.debug(`Update query built`, { query });
    // Return the completed query string
    return query;
}



export const SqlUtils = {
    buildBatchUpdateQuery,
}