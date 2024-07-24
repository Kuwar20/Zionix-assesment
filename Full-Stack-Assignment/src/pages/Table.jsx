import React, { useState } from 'react';
import axios from 'axios';

const InputForm = () => {
    const [partNumber, setPartNumber] = useState('');
    const [volume, setVolume] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const convertToINR = (price, currency) => {
        const rates = {
            USD: 84,
            EUR: 90
        };
        return price * (rates[currency] || 1);
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const responses = await Promise.all([
                axios.post('https://api.mouser.com/api/v1/search/partnumber?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560', {
                    "SearchByPartRequest": {
                        "mouserPartNumber": partNumber,
                        "partSearchOptions": "string"
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }),
                axios.get(`https://www.rutronik24.com/api/search/?apikey=cc6qyfg2yfis&searchterm=${partNumber}`),
                axios.get(`http://api.element14.com//catalog/products?term=manuPartNum:${partNumber}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=wb9wt295qf3g6m842896hh2u`)
            ]);

            // Log responses
            console.log('Mouser Response:', responses[0].data);
            console.log('Rutronik Response:', responses[1].data);
            console.log('Element14 Response:', responses[2].data);

            // Process Mouser data
            const mouserData = (responses[0].data.SearchResults.Parts || []).map(part => ({
                dataProvider: 'Mouser',
                manufacturerPartNumber: part.MouserPartNumber,
                manufacturer: part.Manufacturer,
                volume: volume,
                unitPrice: convertToINR(part.PriceBreaks[0].Price, part.PriceBreaks[0].Currency),
                totalPrice: convertToINR(part.PriceBreaks[0].Price, part.PriceBreaks[0].Currency) * volume
            }));

            // Process Rutronik data
            const rutronikData = (responses[1].data || []).map(part => ({
                dataProvider: 'Rutronik',
                manufacturerPartNumber: part.mpn,
                manufacturer: part.manufacturer,
                volume: volume,
                unitPrice: convertToINR(part.price, part.currency),
                totalPrice: convertToINR(part.price, part.currency) * volume
            }));

            // Process Element14 data
            const element14Data = (responses[2].data.products || []).map(part => ({
                dataProvider: 'Element14',
                manufacturerPartNumber: part.sku, // Assuming SKU is the part number
                manufacturer: part.vendorName,
                volume: volume,
                unitPrice: convertToINR(part.prices[0].price, 'USD'), // Assuming the first price is the relevant one
                totalPrice: convertToINR(part.prices[0].price, 'USD') * volume
            }));

            // Combine and sort results
            const allResults = [...mouserData, ...rutronikData, ...element14Data];
            allResults.sort((a, b) => a.totalPrice - b.totalPrice);

            setResults(allResults);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (partNumber && volume) {
            fetchData();
        } else {
            setError(new Error('Please enter both part number and volume'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-full max-w-4xl">
                <h2 className="text-lg font-semibold mb-6 text-center">Search Part Number</h2>
                <div className="mb-4">
                    <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700">Part Number</label>
                    <input
                        id="partNumber"
                        type="text"
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="volume" className="block text-sm font-medium text-gray-700">Volume</label>
                    <input
                        id="volume"
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Search
                </button>
                {loading && <p className="mt-4 text-center text-gray-500">Loading...</p>}
                {error && <p className="mt-4 text-center text-red-500">Error: {error.message}</p>}
                {results && (
                    <div className="mt-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Provider</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (At the given volume)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price (Unit Price * Volume)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((result, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.manufacturerPartNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.manufacturer}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.dataProvider}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.volume}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.unitPrice.toFixed(2)} INR</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.totalPrice.toFixed(2)} INR</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputForm;
