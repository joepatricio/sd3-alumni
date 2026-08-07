import React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Loader2, Navigation, Search } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ImageUpload } from './ImageUpload';
import { api } from '@/app/views/api';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { Button } from '@components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@components/ui/select';

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    category: z.string().min(1, {
        message: 'Please select an event category.',
    }),
    date: z.string().min(1, {
        message: 'A date for the event is required.',
    }).refine((dateStr) => {
        const eventDate = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
    }, {
        message: 'Event date must be today or in the future.',
    }),
    startTimeHour: z.string(),
    startTimeMinute: z.string(),
    startTimeAmPm: z.string(),
    endTimeHour: z.string(),
    endTimeMinute: z.string(),
    endTimeAmPm: z.string(),
    location: z.object({
        region: z.string().optional(),
        regionCode: z.string().optional(),
        province: z.string().optional(),
        provinceCode: z.string().optional(),
        cityMunicipality: z.string().optional(),
        cityCode: z.string().optional(),
        barangay: z.string().optional(),
        landmark: z.string().optional(),
        street: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional()
    }),
    modality: z.string().optional(),
    description: z.string().min(10, {
        message: 'Description must be at least 10 characters.',
    }),
    image: z.any().refine((val) => val !== undefined && val !== null, {
        message: 'An event image is required.',
    }),
}).superRefine((data, ctx) => {
    if (data.category === 'Virtual') {
        if (!data.modality || data.modality.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Modality (e.g. Zoom, Google Meet) is required for virtual events.",
                path: ['modality']
            });
        }
    } else {
        if (!data.location.cityMunicipality || data.location.cityMunicipality.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "City/Municipality is required",
                path: ['location', 'cityCode']
            });
        }
        if (!data.location.landmark || data.location.landmark.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Landmark is required",
                path: ['location', 'landmark']
            });
        }
    }
});

export interface EventData {
    id?: string;
    title: string;
    category: string;
    date: string;
    startTimeHour: string;
    startTimeMinute: string;
    startTimeAmPm: string;
    endTimeHour: string;
    endTimeMinute: string;
    endTimeAmPm: string;
    location: {
        region: string;
        regionCode?: string;
        province?: string;
        provinceCode?: string;
        cityMunicipality: string;
        cityCode?: string;
        barangay: string;
        landmark: string;
        street?: string;
        lat?: number;
        lng?: number;
    };
    modality?: string;
    description: string;
    image?: string | File | null;
}

interface CreateEventModalProps {
    trigger?: React.ReactNode;
    initialData?: EventData;
    isAdmin?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateEventModal({ trigger, initialData, isAdmin, open: externalOpen, onOpenChange: externalOnOpenChange }: CreateEventModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = externalOnOpenChange || setInternalOpen;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // PSGC Dynamic Load States
    const [psgcData, setPsgcData] = useState<{
        psgcRegions: any[];
        psgcProvinces: any[];
        psgcCities: any[];
        psgcBarangays: any[];
    } | null>(null);
    const [isLoadingPsgc, setIsLoadingPsgc] = useState(false);

    // PSGC States
    const [regions, setRegions] = useState<any[]>([]);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [barangays, setBarangays] = useState<any[]>([]);

    // Map States
    const [mapCenter, setMapCenter] = useState<[number, number]>([12.8797, 121.7740]); // Default: Philippines
    const [mapZoom, setMapZoom] = useState(5);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [programmaticKey, setProgrammaticKey] = useState(0);

    const [categories, setCategories] = useState<{ id: string, eventCategoryName: string }[]>([]);

    useEffect(() => {
        if (open && categories.length === 0) {
            api.get('/eventCategories')
                .then(res => {
                    if (Array.isArray(res.data)) {
                        setCategories(res.data);
                    }
                })
                .catch(err => console.error('Failed to fetch event categories:', err));
        }
    }, [open, categories.length]);

    // Load PSGC data dynamically when modal is opened
    useEffect(() => {
        if (open && !psgcData && !isLoadingPsgc) {
            setIsLoadingPsgc(true);
            import('@assets/psgc_prefetch')
                .then((module) => {
                    setPsgcData({
                        psgcRegions: module.psgcRegions,
                        psgcProvinces: module.psgcProvinces,
                        psgcCities: module.psgcCities,
                        psgcBarangays: module.psgcBarangays,
                    });
                    setIsLoadingPsgc(false);
                })
                .catch((err) => {
                    console.error('Failed to load PSGC data:', err);
                    setIsLoadingPsgc(false);
                });
        }
    }, [open, psgcData, isLoadingPsgc]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            category: '',
            description: '',
            date: '',
            startTimeHour: '12',
            startTimeMinute: '00',
            startTimeAmPm: 'AM',
            endTimeHour: '1',
            endTimeMinute: '00',
            endTimeAmPm: 'PM',
            location: {
                region: '',
                regionCode: '',
                province: '',
                provinceCode: '',
                cityMunicipality: '',
                cityCode: '',
                barangay: '',
                landmark: '',
                street: '',
            },
            modality: ''
        },
    });

    // Effect to update basic form values when initialData changes or modal opens
    useEffect(() => {
        if (initialData && open) {
            let formattedDate = initialData.date || (initialData as any).eventDate;
            if (formattedDate) {
                const d = new Date(formattedDate);
                if (!isNaN(d.getTime())) {
                    formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                }
            }

            let parsedLocation = initialData.location;
            if (typeof parsedLocation === 'string') {
                try {
                    const parsed = JSON.parse(parsedLocation);
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        parsedLocation = parsed;
                    } else {
                        throw new Error('Not an object');
                    }
                } catch(e) {
                    parsedLocation = {
                        region: '',
                        regionCode: '',
                        province: '',
                        provinceCode: '',
                        cityMunicipality: '',
                        cityCode: '',
                        barangay: '',
                        landmark: parsedLocation as any,
                        street: '',
                        lat: 10.2954,
                        lng: 123.8944
                    };
                }
            } 
            if (parsedLocation && !(parsedLocation as any).lat) {
                parsedLocation = { ...parsedLocation as any, lat: 10.2954, lng: 123.8944 };
            }

            form.reset({
                title: initialData.title,
                category: (initialData as any).eventCategory?.eventCategoryName || initialData.category,
                location: {
                    region: (parsedLocation as any)?.region || '',
                    regionCode: (parsedLocation as any)?.regionCode || '',
                    province: (parsedLocation as any)?.province || '',
                    provinceCode: (parsedLocation as any)?.provinceCode || '',
                    cityMunicipality: (parsedLocation as any)?.cityMunicipality || '',
                    cityCode: (parsedLocation as any)?.cityCode || '',
                    barangay: (parsedLocation as any)?.barangay || '',
                    landmark: (parsedLocation as any)?.landmark || '',
                    street: (parsedLocation as any)?.street || '',
                    lat: (parsedLocation as any)?.lat || 10.2954,
                    lng: (parsedLocation as any)?.lng || 123.8944,
                },
                description: initialData.description,
                date: formattedDate,
                startTimeHour: initialData.startTimeHour || '12',
                startTimeMinute: initialData.startTimeMinute || '00',
                startTimeAmPm: initialData.startTimeAmPm || 'AM',
                endTimeHour: initialData.endTimeHour || '1',
                endTimeMinute: initialData.endTimeMinute || '00',
                endTimeAmPm: initialData.endTimeAmPm || 'PM',
                modality: initialData.modality || '',
                image: (initialData as any).eventImage || initialData.image,
            });

            const imgData = (initialData as any).eventImage || initialData.image;
            if (typeof imgData === 'string') {
                setPreviewUrl(imgData);
            } else {
                setPreviewUrl(null);
            }
        } else if (!initialData && open) {
            form.reset({
                title: '',
                category: '',
                description: '',
                date: '',
                startTimeHour: '12',
                startTimeMinute: '00',
                startTimeAmPm: 'AM',
                endTimeHour: '1',
                endTimeMinute: '00',
                endTimeAmPm: 'PM',
                location: {
                    region: '',
                    regionCode: '',
                    province: '',
                    provinceCode: '',
                    cityMunicipality: '',
                    cityCode: '',
                    barangay: '',
                    landmark: '',
                    street: '',
                },
                modality: '',
                image: undefined,
            });
            setPreviewUrl(null);
        }
    }, [initialData, form, open]);

    // Robust PSGC location resolver supporting exact codes, digit prefixes, and normalized names
    const resolvePsgcLocation = (loc: any) => {
        if (!psgcData || !loc) return null;

        const normalize = (s?: string) =>
            s ? s.toLowerCase().replace(/city of|city|municipality of|municipality|province of|province|region|the|district/gi, '').trim() : '';

        const digitsOnly = (s?: string) => (s ? s.replace(/[^0-9]/g, '') : '');

        const regDigits = digitsOnly(loc.regionCode);
        const provDigits = digitsOnly(loc.provinceCode);
        const cityDigits = digitsOnly(loc.cityCode);

        // 1. Resolve Region
        let matchedRegion = psgcData.psgcRegions.find((r: any) => {
            if (loc.regionCode && r.code === loc.regionCode) return true;
            if (regDigits && digitsOnly(r.code).startsWith(regDigits)) return true;
            if (loc.region && normalize(r.name) === normalize(loc.region)) return true;
            return false;
        });

        // 2. Resolve Province
        let matchedProvince = psgcData.psgcProvinces.find((p: any) => {
            if (loc.provinceCode && p.code === loc.provinceCode) return true;
            if (provDigits && digitsOnly(p.code).startsWith(provDigits)) return true;
            if (loc.province && normalize(p.name) === normalize(loc.province)) return true;
            return false;
        });

        if (matchedProvince && !matchedRegion) {
            matchedRegion = psgcData.psgcRegions.find((r: any) => r.code === matchedProvince.regionCode);
        }

        // 3. Resolve City
        const candidateCities = matchedProvince
            ? psgcData.psgcCities.filter((c: any) => c.provinceCode === matchedProvince.code)
            : matchedRegion
            ? psgcData.psgcCities.filter((c: any) => c.provinceCode === matchedRegion.code)
            : psgcData.psgcCities;

        let matchedCity = candidateCities.find((c: any) => {
            if (loc.cityCode && c.code === loc.cityCode) return true;
            if (cityDigits && digitsOnly(c.code).startsWith(cityDigits)) return true;
            if (loc.cityMunicipality && normalize(c.name) === normalize(loc.cityMunicipality)) return true;
            return false;
        });

        if (matchedCity) {
            if (!matchedProvince && matchedCity.provinceCode) {
                matchedProvince = psgcData.psgcProvinces.find((p: any) => p.code === matchedCity.provinceCode) || null;
            }
            if (!matchedRegion) {
                const rCode = matchedProvince ? matchedProvince.regionCode : matchedCity.provinceCode;
                matchedRegion = psgcData.psgcRegions.find((r: any) => r.code === rCode) || null;
            }
        }

        // 4. Resolve Barangay
        let matchedBarangay: any = null;
        if (matchedCity && loc.barangay) {
            const candidateBrgys = psgcData.psgcBarangays.filter((b: any) => b.cityCode === matchedCity.code);
            const normBrgy = normalize(loc.barangay);
            matchedBarangay = candidateBrgys.find((b: any) => {
                const nB = normalize(b.name);
                return nB === normBrgy || nB.includes(normBrgy) || normBrgy.includes(nB);
            });
        }

        return {
            regionCode: matchedRegion?.code || loc.regionCode || '',
            region: matchedRegion?.name || loc.region || '',
            provinceCode: matchedProvince?.code || loc.provinceCode || '',
            province: matchedProvince?.name || loc.province || '',
            cityCode: matchedCity?.code || loc.cityCode || '',
            cityMunicipality: matchedCity?.name || loc.cityMunicipality || '',
            barangay: matchedBarangay?.name || loc.barangay || '',
            landmark: loc.landmark || (loc as any).address || '',
            street: loc.street || '',
            lat: loc.lat,
            lng: loc.lng
        };
    };

    // Synchronously populate region, province, city, and barangay options and set form location values
    const applyLocationData = (rawLoc: any) => {
        if (!psgcData || !rawLoc) return;

        const resolved = resolvePsgcLocation(rawLoc);
        if (!resolved) return;

        const sortedRegions = [...psgcData.psgcRegions].sort((a: any, b: any) => a.name.localeCompare(b.name));
        setRegions(sortedRegions);

        let provs: any[] = [];
        let citiesList: any[] = [];
        let brgyList: any[] = [];

        if (resolved.regionCode) {
            provs = psgcData.psgcProvinces
                .filter((p: any) => p.regionCode === resolved.regionCode)
                .sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        if (resolved.provinceCode) {
            citiesList = psgcData.psgcCities
                .filter((c: any) => c.provinceCode === resolved.provinceCode)
                .sort((a: any, b: any) => a.name.localeCompare(b.name));
        } else if (resolved.regionCode && provs.length === 0) {
            citiesList = psgcData.psgcCities
                .filter((c: any) => c.provinceCode === resolved.regionCode)
                .sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        if (resolved.cityCode) {
            brgyList = psgcData.psgcBarangays
                .filter((b: any) => b.cityCode === resolved.cityCode)
                .sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        setProvinces(provs);
        setCities(citiesList);
        setBarangays(brgyList);

        form.setValue('location.regionCode', resolved.regionCode);
        form.setValue('location.region', resolved.region);
        form.setValue('location.provinceCode', resolved.provinceCode);
        form.setValue('location.province', resolved.province);
        form.setValue('location.cityCode', resolved.cityCode);
        form.setValue('location.cityMunicipality', resolved.cityMunicipality);
        form.setValue('location.barangay', resolved.barangay);
        if (resolved.landmark) {
            form.setValue('location.landmark', resolved.landmark);
        }
        if (resolved.street) {
            form.setValue('location.street', resolved.street);
        }

        if (resolved.lat && resolved.lng) {
            form.setValue('location.lat', resolved.lat);
            form.setValue('location.lng', resolved.lng);
            setMapCenter([resolved.lat, resolved.lng]);
            setMapZoom(15);
        }

        setProgrammaticKey(prev => prev + 1);
    };

    // Populate regions and hydrate location data when modal opens and psgcData is ready
    useEffect(() => {
        if (!open || !psgcData) return;

        const sortedRegions = [...psgcData.psgcRegions].sort((a: any, b: any) => a.name.localeCompare(b.name));
        setRegions(sortedRegions);

        if (initialData) {
            let parsedLocation = initialData.location;
            if (typeof parsedLocation === 'string') {
                try {
                    const parsed = JSON.parse(parsedLocation);
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        parsedLocation = parsed;
                    }
                } catch (e) {}
            }
            if (parsedLocation && typeof parsedLocation === 'object') {
                applyLocationData(parsedLocation as any);
            }
        }
    }, [open, psgcData, initialData]);

    // Fetch provinces when region changes
    const handleRegionChange = (regionCode: string) => {
        if (!psgcData) return;
        const region = psgcData.psgcRegions.find((r: any) => r.code === regionCode);
        form.setValue('location.region', region?.name || '');
        form.setValue('location.regionCode', regionCode);
        form.setValue('location.province', '');
        form.setValue('location.provinceCode', '');
        form.setValue('location.cityMunicipality', '');
        form.setValue('location.cityCode', '');
        form.setValue('location.barangay', '');
        setProvinces([]);
        setCities([]);
        setBarangays([]);

        if (!regionCode) return;

        const provs = psgcData.psgcProvinces.filter((p: any) => p.regionCode === regionCode);
        if (provs.length > 0) {
            setProvinces(provs.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        } else {
            const fallbackCities = psgcData.psgcCities.filter((c: any) => c.provinceCode === regionCode);
            setCities(fallbackCities.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        }
    };

    // Fetch cities when province changes
    const handleProvinceChange = (provinceCode: string) => {
        if (!psgcData) return;
        const province = psgcData.psgcProvinces.find((p: any) => p.code === provinceCode);
        form.setValue('location.province', province?.name || '');
        form.setValue('location.provinceCode', provinceCode);
        form.setValue('location.cityMunicipality', '');
        form.setValue('location.cityCode', '');
        form.setValue('location.barangay', '');
        setCities([]);
        setBarangays([]);

        if (!provinceCode) return;
        const matchedCities = psgcData.psgcCities.filter((c: any) => c.provinceCode === provinceCode);
        setCities(matchedCities.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    };

    // Fetch barangays when city changes
    const handleCityChange = (cityCode: string) => {
        if (!psgcData) return;
        const city = psgcData.psgcCities.find((c: any) => c.code === cityCode);
        form.setValue('location.cityMunicipality', city?.name || '');
        form.setValue('location.cityCode', cityCode);
        form.setValue('location.barangay', '');
        setBarangays([]);

        if (!cityCode) return;
        const matchedBrgys = psgcData.psgcBarangays.filter((b: any) => b.cityCode === cityCode);
        setBarangays(matchedBrgys.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    };

    // Make address matching reusable
    const matchAddressFromProperties = (address: any) => {
        if (!address || !psgcData) return;
        const normalize = (s: string) => s ? s.toLowerCase().replace(/city of|city|municipality of|municipality|province of|province|region|the|district/gi, '').trim() : '';
        let matchedCity: any = null;
        let matchedProvince: any = null;
        let matchedRegion: any = null;
        let matchedBarangay: any = null;

        const normState = normalize(address.state || address.region);
        const normCounty = normalize(address.county || address.province);

        const citySearchTerms = [address.city, address.town, address.municipality, address.county].filter(Boolean);
        for (const term of citySearchTerms) {
            const nTerm = normalize(term);
            const cityMatches = psgcData.psgcCities.filter(c => {
                const cName = normalize(c.name);
                return cName === nTerm || cName.includes(nTerm) || nTerm.includes(cName);
            });

            if (cityMatches.length > 0) {
                matchedCity = cityMatches.find(c => {
                    const prov = psgcData.psgcProvinces.find(p => p.code === c.provinceCode);
                    const reg = psgcData.psgcRegions.find(r => r.code === c.provinceCode || r.code === prov?.regionCode);
                    const pName = prov ? normalize(prov.name) : '';
                    const rName = reg ? normalize(reg.name) : '';
                    return [normState, normCounty].some(n => n && ((pName && pName.includes(n)) || (n && pName.includes(n)) || (rName && rName.includes(n)) || (n && rName.includes(n))));
                }) || cityMatches[0];
                break;
            }
        }

        if (!matchedCity) {
            const provSearchTerms = [address.county, address.state, address.province].filter(Boolean);
            for (const term of provSearchTerms) {
                const nTerm = normalize(term);
                matchedProvince = psgcData.psgcProvinces.find(p => {
                    const pName = normalize(p.name);
                    return pName === nTerm || pName.includes(nTerm) || nTerm.includes(pName);
                });
                if (matchedProvince) break;
            }
        }

        if (matchedCity) {
            matchedProvince = matchedCity.provinceCode ? psgcData.psgcProvinces.find(p => p.code === matchedCity.provinceCode) : null;
            const regionCode = matchedProvince ? matchedProvince.regionCode : matchedCity.provinceCode;
            matchedRegion = psgcData.psgcRegions.find(r => r.code === regionCode);
        } else if (matchedProvince) {
            matchedRegion = psgcData.psgcRegions.find(r => r.code === matchedProvince.regionCode);
        } else {
            const regSearchTerms = [address.state, address.region].filter(Boolean);
            for (const term of regSearchTerms) {
                const nTerm = normalize(term);
                matchedRegion = psgcData.psgcRegions.find(r => {
                    const rName = normalize(r.name);
                    return rName === nTerm || rName.includes(nTerm) || rName.includes(rName);
                });
                if (matchedRegion) break;
            }
        }

        if (matchedCity) {
            const possibleBarangays = psgcData.psgcBarangays.filter(b => b.cityCode === matchedCity.code);
            const brgySearchTerms = [address.suburb, address.village, address.neighbourhood, address.quarter, address.residential].filter(Boolean);
            for (const term of brgySearchTerms) {
                const nTerm = normalize(term);
                matchedBarangay = possibleBarangays.find(b => {
                    const bName = normalize(b.name);
                    return bName === nTerm || bName.includes(nTerm) || nTerm.includes(bName);
                });
                if (matchedBarangay) break;
            }
        }

        if (matchedRegion) {
            const landmark = address.amenity || address.name || address.building || '';
            const street = address.road || address.neighbourhood || address.suburb || '';
            applyLocationData({
                regionCode: matchedRegion.code,
                region: matchedRegion.name,
                provinceCode: matchedProvince?.code || '',
                province: matchedProvince?.name || '',
                cityCode: matchedCity?.code || '',
                cityMunicipality: matchedCity?.name || '',
                barangay: matchedBarangay?.name || '',
                landmark: landmark || undefined,
                street: street || undefined
            });
        }
    };



    // Map search and location handlers
    const handleSelectLocation = (feature: any) => {
        const lat = parseFloat(feature.lat);
        const lng = parseFloat(feature.lon);
        setMapCenter([lat, lng]);
        setMapZoom(15);
        form.setValue('location.lat', lat);
        form.setValue('location.lng', lng);
        const landmarkName = feature.address?.amenity || feature.name || feature.display_name?.split(',')[0] || '';
        form.setValue('location.landmark', landmarkName);

        matchAddressFromProperties(feature.address);

        setShowSuggestions(false);
        setSearchResults([]);
    };
    const searchLocation = async () => {
        const query = form.getValues('location.landmark');
        if (!query || !query.trim()) return;
        setIsSearchingLocation(true);
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=ph&limit=5`);
            if (data && data.length > 0) {
                setSearchResults(data);
                setShowSuggestions(true);
            } else {
                setSearchResults([]);
                setShowSuggestions(false);
                toast.error("Location not found in the Philippines.");
            }
        } catch (error) {
            toast.error("Failed to search location.");
            setSearchResults([]);
            setShowSuggestions(false);
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const reverseGeocode = async () => {
        const lat = form.getValues('location.lat');
        const lng = form.getValues('location.lng');
        if (!lat || !lng) {
            toast.error("Please pin a location on the map first.");
            return;
        }

        setIsSearchingLocation(true);
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            if (data && data.address) {
                const address = data.address;
                const landmark = address.amenity || data.name || '';
                const street = address.road || address.neighbourhood || address.suburb || data.display_name?.split(',')[0] || '';

                if (landmark || street) {
                    form.setValue('location.landmark', landmark);
                    form.setValue('location.street', street);
                    toast.success(`Location set.`);

                    if (data.lat && data.lon) {
                        const newLat = parseFloat(data.lat);
                        const newLng = parseFloat(data.lon);
                        form.setValue('location.lat', newLat);
                        form.setValue('location.lng', newLng);
                        setMapCenter([newLat, newLng]);
                        setMapZoom(15);
                    }
                } else {
                    toast.info("No specific landmark found at this pin.");
                }

                // Attempt to match and update PSGC fields
                matchAddressFromProperties(address);
            }
        } catch (error) {
            toast.error("Failed to reverse geocode.");
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const MapEventHandler = () => {
        const map = useMap();

        useEffect(() => {
            map.setView(mapCenter, mapZoom);
        }, [mapCenter, mapZoom, map]);

        useEffect(() => {
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                form.setValue('location.lat', lat);
                form.setValue('location.lng', lng);
                setMapCenter([lat, lng]);
                setMapZoom(15);
            });

            return () => {
                map.off('click');
            };
        }, [map]);

        return null;
    };


    // Watch lat/lng for dynamic pointer updates
    const currentLat = form.watch('location.lat');
    const currentLng = form.watch('location.lng');
    const selectedCategory = form.watch('category');

    const mapDisplay = React.useMemo(() => (
        <div className="h-[250px] w-full bg-gray-100 rounded-md overflow-hidden relative z-0 border border-input">
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEventHandler />
                {currentLat && currentLng && (
                    <Marker position={[currentLat, currentLng]} />
                )}
            </MapContainer>
        </div>
    ), [mapCenter, mapZoom, currentLat, currentLng]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Construct final time strings
        const startTime = `${values.startTimeHour}:${values.startTimeMinute} ${values.startTimeAmPm}`;
        const endTime = `${values.endTimeHour}:${values.endTimeMinute} ${values.endTimeAmPm}`;

        // Prepare Location payload - Backend might expect location to be handled separately or nested if Prisma allows it.
        // Prisma allows nested create via relation: `location: { create: { ... } }` or just sending locationId. 
        // For simplicity and since we don't have the exact backend mapping for nested creations without seeing it,
        // we'll format the values exactly as they are in the schema and let the backend handle it, or send it directly.
        const finalImage = values.image || previewUrl;
        const payload: any = {
            title: values.title,
            description: values.description,
            eventDate: values.date,
            startTime,
            endTime,
            modality: values.modality,
            eventCategoryId: values.category,
            eventImage: finalImage,
            image: finalImage,
            // the generic backend might not support nested create dynamically unless defined.
            // But we will send the location nested for now. 
            // In a real app we'd create the location first or have the backend handle it.
            location: {
                region: values.location.region,
                regionCode: values.location.regionCode,
                province: values.location.province,
                provinceCode: values.location.provinceCode,
                cityMunicipality: values.location.cityMunicipality,
                cityCode: values.location.cityCode,
                barangay: values.location.barangay,
                landmark: values.location.landmark,
                street: values.location.street,
                lat: values.location.lat,
                lng: values.location.lng,
            }
        };

        if (isAdmin && initialData) {
            payload.reviewDate = new Date().toISOString();
        }

        try {
            const isEditMode = !!initialData;
            const endpoint = isAdmin ? `/admin/events` : `/events`;
            const token = sessionStorage.getItem('adminToken') || sessionStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

            if (isEditMode && initialData?.id) {
                const patchEndpoint = isAdmin ? `/admin/events/${initialData.id}` : `/events/${initialData.id}`;
                await api.patch(patchEndpoint, payload, { headers });
            } else {
                await api.post(endpoint, payload, { headers });
            }

            const isPending = !isAdmin && isEditMode;
            const message = initialData
                ? (isPending ? 'Event update submitted for review!' : 'Event successfully updated!')
                : 'Event successfully created!';
            const description = initialData
                ? (isPending ? 'Your changes require admin approval before they are live.' : 'Your changes have been saved.')
                : 'Your event has been scheduled.';

            toast.success(message, {
                description: description,
            });
            setOpen(false);
            if (!initialData) {
                form.reset();
                setPreviewUrl(null);
            }
        } catch (error) {
            console.error("Failed to save event", error);
            toast.error("Failed to save event. Please try again.");
        }
    }

    const handleFileSelect = (url: string) => {
        setPreviewUrl(url);
        form.setValue('image', url);
    };

    const handleClearImage = () => {
        setPreviewUrl(null);
        form.setValue('image', undefined);
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const ampm = ['AM', 'PM'];

    const isEditMode = !!initialData;

    // Return function
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Event' : 'Create Event'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update event details.' : 'Schedule a new event for the alumni community.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Event Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="selection:bg-blue-500 selection:text-white"
                                                placeholder="Annual Homecoming..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.eventCategoryName}>
                                                        {category.eventCategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="w-full selection:bg-blue-500 selection:text-white"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Start Time Picker */}
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name="startTimeHour"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="startTimeMinute"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="startTimeAmPm"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="AM/PM" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {ampm.map(ap => <SelectItem key={ap} value={ap}>{ap}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </FormItem>

                            {/* End Time Picker */}
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name="endTimeHour"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endTimeMinute"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endTimeAmPm"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="AM/PM" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {ampm.map(ap => <SelectItem key={ap} value={ap}>{ap}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </FormItem>

                            {selectedCategory !== 'Virtual' ? (
                                <div className="md:col-span-2 space-y-4">
                                    <FormLabel className='mb-2'>Location</FormLabel>
                                    <div className="flex gap-2 mb-2 mt-1 relative items-start">
                                        <FormField
                                            control={form.control}
                                            name="location.landmark"
                                            render={({ field }) => (
                                                <FormItem className="relative flex-1 space-y-0">
                                                    <FormControl>
                                                        <Input
                                                            className='selection:bg-blue-500 selection:text-white'
                                                            placeholder="Input event location (e.g. USJ-R Main Campus)"
                                                            {...field}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    searchLocation();
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />

                                                    {/* Autocomplete Dropdown */}
                                                    {showSuggestions && searchResults.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                                                            {searchResults.map((feature, idx) => {
                                                                const p = feature.address || {};
                                                                const label = feature.display_name;
                                                                const title = feature.name || p.city || p.town || p.state || label.split(',')[0];
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                                        onMouseDown={(e) => { e.preventDefault(); handleSelectLocation(feature); }}
                                                                    >
                                                                        <div className="font-semibold">{title}</div>
                                                                        <div className="text-xs text-gray-500">{label}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            className="cursor-pointer"
                                            type="button"
                                            onClick={searchLocation}
                                            disabled={isSearchingLocation}
                                            variant="secondary"
                                        >
                                            Search <Search className="w-4 h-4 ml-2" />
                                        </Button>

                                        <Button
                                            className="cursor-pointer text-brand-primary border-brand-primary"
                                            type="button"
                                            variant="outline"
                                            onClick={reverseGeocode}
                                            disabled={isSearchingLocation || !form.getValues('location.lat')}
                                        >
                                            Auto-complete
                                            <Navigation className="w-4 h-4 mr-2" />
                                        </Button>
                                    </div>

                                    <div>
                                        {mapDisplay}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="location.regionCode"
                                            render={({ field }) => (
                                                <FormItem className="relative mb-4">
                                                    <FormLabel>Region</FormLabel>
                                                    <Select
                                                        key={`regionSelect-${programmaticKey}`}
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            handleRegionChange(val);
                                                        }}
                                                        value={field.value || undefined}
                                                        disabled={isLoadingPsgc}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={isLoadingPsgc ? "Loading region options..." : "Select Region"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {regions.map((r) => (
                                                                <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="absolute top-full mt-1 w-full text-xs">
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="location.provinceCode"
                                            render={({ field }) => (
                                                <FormItem className="relative mb-4">
                                                    <FormLabel>Province</FormLabel>
                                                    <Select
                                                        key={`provinceSelect-${programmaticKey}`}
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            handleProvinceChange(val);
                                                        }}
                                                        value={field.value || undefined}
                                                        disabled={provinces.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={provinces.length === 0 && cities.length > 0 && form.getValues('location.regionCode') ? "N/A" : "Select Province"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {provinces.map((p) => (
                                                                <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="absolute top-full mt-1 w-full text-xs">
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="location.cityCode"
                                            render={({ field }) => (
                                                <FormItem className="relative mb-4">
                                                    <FormLabel>City / Municipality</FormLabel>
                                                    <Select
                                                        key={`citySelect-${programmaticKey}`}
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            handleCityChange(val);
                                                        }}
                                                        value={field.value || undefined}
                                                        disabled={cities.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select City/Municipality" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {cities.map((c) => (
                                                                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="absolute top-full mt-1 w-full text-xs">
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="location.barangay"
                                            render={({ field }) => (
                                                <FormItem className="relative mb-4">
                                                    <FormLabel>Barangay</FormLabel>
                                                    <Select
                                                        key={`barangaySelect-${programmaticKey}`}
                                                        onValueChange={(val) => {
                                                            const b = barangays.find(bg => bg.code === val);
                                                            field.onChange(b?.name || '');
                                                        }}
                                                        // use value mapped to the name, we use barangay name in form state
                                                        value={barangays.find(bg => bg.name === field.value)?.code || undefined}
                                                        disabled={barangays.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Barangay" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {barangays.map((b) => (
                                                                <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="absolute top-full mt-1 w-full text-xs">
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="location.street"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-1">
                                                    <FormLabel>Building / Street / Purok / Sitio</FormLabel>
                                                    <FormControl>
                                                        <Input className='selection:bg-blue-500 selection:text-white' placeholder="Enter precise address description" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="modality"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Modality</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Input event modality (e.g. Zoom, Google Meet)"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormItem className="md:col-span-2">
                                <FormLabel>Banner Image (Optional)</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <ImageUpload
                                            previewUrl={previewUrl}
                                            onFileSelect={handleFileSelect}
                                            onClear={handleClearImage}
                                            placeholderText="Click or drag to upload event banner"
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide details about the event..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button className="bg-brand-primary  hover:bg-brand-primary-hover" type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditMode ? 'Save Changes' : 'Create Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
