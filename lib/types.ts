export interface CountriesResponse {
    value: string,
    label: string,
    flag: string,
    population: number,
    capital: string | null,
    languages: string[],
    currencies: string[],
}