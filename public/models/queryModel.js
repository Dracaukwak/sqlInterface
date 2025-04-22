 
export async function executeQuery(query) {
    const response = await fetch('/execute-query', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return response.json();
}
