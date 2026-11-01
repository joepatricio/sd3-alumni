export interface PSGCRegion {
    code: string;
    name: string;
    regionName?: string;
}

export interface PSGCProvince {
    code: string;
    name: string;
    regionCode: string;
}

export interface PSGCCity {
    code: string;
    name: string;
    provinceCode: string;
}

export interface PSGCBarangay {
    code: string;
    name: string;
    cityCode: string;
}

export interface PSGCData {
    psgcRegions: PSGCRegion[];
    psgcProvinces: PSGCProvince[];
    psgcCities: PSGCCity[];
    psgcBarangays: PSGCBarangay[];
}

export interface NominatimAddress {
    road?: string;
    street?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    municipality?: string;
    village?: string;
    province?: string;
    state?: string;
    region?: string;
    country?: string;
    postcode?: string;
    [key: string]: string | undefined;
}

export interface NominatimSearchResult {
    place_id: number | string;
    osm_id?: number | string;
    lat: string;
    lon: string;
    display_name: string;
    name?: string;
    address?: NominatimAddress;
}

