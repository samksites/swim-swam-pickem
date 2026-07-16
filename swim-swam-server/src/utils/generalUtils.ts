/**
 * Splits objects into insert and update value arrays based on id, using specified fields.
 * @param items - Array of objects to process (must have .id field)
 * @param fieldNames - Array of strings representing the fields to extract from each object
 * @returns { insertValues: any[][], updateValues: any[][] }
 */
export function splitInsertUpdateValues(items: any[], fieldNames: string[], parentIdField: number): { insertValues: any[][], updateValues: any[][] } {
  const insertValues: any[][] = [];
  const updateValues: any[][] = [];

  items.forEach(item => {

    var values = fieldNames.map(field => item[field]);
    if (Number(item.id) < 0) { 
        // Add parent ID to values array if it's an insert (id < 0)
        values.push(parentIdField);
        insertValues.push(values);
    } else {
        updateValues.push(values);
    }
  });

  return { insertValues, updateValues };


}
/**
 * Returns an array of values from an object, mapped by the provided field names.
 * @param obj - The object to extract values from
 * @param fieldNames - Array of field names to extract
 * @returns Array of values in the order of fieldNames
 */
export function returnMappedFields(obj: any, fieldNames: string[]): any[] {
  return fieldNames.map(field => obj[field]);
}