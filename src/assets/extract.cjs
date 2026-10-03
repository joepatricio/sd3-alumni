const fs = require('fs');
const content = fs.readFileSync('c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/public/psgc.json', 'utf8');

const {
    psgcRegions: regions,
    psgcProvinces: provinces,
    psgcCities: cities,
    psgcBarangays: barangays
} = JSON.parse(content);

const r7 = regions.find(r => r.code === '070000000');
const cebu = provinces.find(p => p.code === '072200000');
const cebuCity = cities.find(c => c.provinceCode === '072200000' && c.name.toUpperCase().includes('CEBU'));
const mandaue = cities.find(c => c.provinceCode === '072200000' && c.name.toUpperCase().includes('MANDAUE'));

console.log('Region:', r7);
console.log('Province:', cebu);
console.log('Cebu City:', cebuCity);
console.log('Mandaue:', mandaue);

console.log('Ermita:', barangays.find(b => b.cityCode === cebuCity.code && b.name.includes('Ermita')));
console.log('Mabolo:', barangays.find(b => b.cityCode === cebuCity.code && b.name.includes('Mabolo')));
console.log('Lahug:', barangays.find(b => b.cityCode === cebuCity.code && b.name.includes('Lahug')));
console.log('Basak Pardo:', barangays.find(b => b.cityCode === cebuCity.code && b.name.includes('Basak Pardo')) || barangays.find(b => b.cityCode === cebuCity.code && b.name.includes('Basak')));
console.log('San Nicolas:', barangays.find(b => b.cityCode === cebuCity.code && b.name.includes('San Nicolas')));
console.log('Banilad (Mandaue):', barangays.find(b => b.cityCode === mandaue.code && b.name.includes('Banilad')));
