const frenchWineRegions = [
    {
        id: 1,
        name: 'Alsace',
        coordinates: { latitude: 48.5905, longitude: 7.5298 },
        hectares_uprooted: 200,
        producer_count: 50,
        grape_varieties: ['Riesling', 'Gewürztraminer', 'Pinot Gris'],
        program_status: 'Completed',
        year_started: 2020,
        expected_completion: 2022,
        funding_allocated: 500000,
        notes: 'Successful program aimed at sustainability.'
    },
    {
        id: 2,
        name: 'Bordeaux',
        coordinates: { latitude: 44.8350, longitude: -0.5565 },
        hectares_uprooted: 500,
        producer_count: 240,
        grape_varieties: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'],
        program_status: 'Ongoing',
        year_started: 2021,
        expected_completion: 2025,
        funding_allocated: 1500000,
        notes: 'Focus on replanting with disease-resistant varieties.'
    },
    {
        id: 3,
        name: 'Burgundy',
        coordinates: { latitude: 47.0301, longitude: 4.8626 },
        hectares_uprooted: 300,
        producer_count: 120,
        grape_varieties: ['Pinot Noir', 'Chardonnay'],
        program_status: 'Planned',
        year_started: 2023,
        expected_completion: 2026,
        funding_allocated: 700000,
        notes: 'Ecosystem restoration alongside wine production.'
    },
    {
        id: 4,
        name: 'Loire Valley',
        coordinates: { latitude: 47.3416, longitude: 0.6229 },
        hectares_uprooted: 150,
        producer_count: 80,
        grape_varieties: ['Sauvignon Blanc', 'Chenin Blanc'],
        program_status: 'Completed',
        year_started: 2019,
        expected_completion: 2021,
        funding_allocated: 300000,
        notes: 'Incorporating local biodiversity into vineyards.'
    },
    {
        id: 5,
        name: 'Rhône Valley',
        coordinates: { latitude: 44.4177, longitude: 4.8651 },
        hectares_uprooted: 250,
        producer_count: 200,
        grape_varieties: ['Grenache', 'Syrah', 'Mourvèdre'],
        program_status: 'Ongoing',
        year_started: 2020,
        expected_completion: 2024,
        funding_allocated: 1000000,
        notes: 'Transitioning towards organic practices.'
    },
    {
        id: 6,
        name: 'Provence',
        coordinates: { latitude: 43.8477, longitude: 6.8293 },
        hectares_uprooted: 100,
        producer_count: 60,
        grape_varieties: ['Grenache', 'Cinsault'],
        program_status: 'Planned',
        year_started: 2023,
        expected_completion: 2025,
        funding_allocated: 200000,
        notes: 'Focus on regeneration of local grape varieties.'
    }
];

module.exports = frenchWineRegions;