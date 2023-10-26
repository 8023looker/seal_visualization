export async function load_data(file_name = "data.json") {
    let data = await d3.json(file_name);
    return data;
}
