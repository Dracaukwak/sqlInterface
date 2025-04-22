 
export async function getTables() {
    const response = await fetch('/list-tables');
    if (!response.ok) throw new Error("Unable to load tables");
    return response.json();
}

export async function getTableData(tableName, offset, limit) {
    const response = await fetch(`/table-data/${tableName}?offset=${offset}&limit=${limit}`);
    if (!response.ok) throw new Error("Unable to load table data");
    return response.json();
}
