import React, { useState } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaSearch, FaTimesCircle } from 'react-icons/fa';

const MOUSER_API_KEY = import.meta.env.VITE_MOUSER_API_KEY;
const RUTRONIK_API_KEY = import.meta.env.VITE_RUTRONIK_API_KEY;
const ELEMENT14_API_KEY = import.meta.env.VITE_ELEMENT14_API_KEY;

const InputForm = () => {
    const [partNumber, setPartNumber] = useState('');
    const [volume, setVolume] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const convertToINR = (price, currency) => {
        // Convert price to a number if it's a string
        let numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : price;
    
        // Check if the conversion resulted in a valid number
        if (isNaN(numericPrice)) {
            console.error('Invalid price format:', price);
            return 0; // or handle this error as appropriate for your application
        }
    
        // Conversion rates (you should use up-to-date rates)
        const conversionRates = {
            'USD': 84, // 1 USD = 74.5 INR (example rate)
            'EUR': 90, // 1 EUR = 88.5 INR (example rate)
            // Add other currencies as needed
        };
    
        // Convert to INR if not already in INR
        if (currency !== 'INR') {
            if (conversionRates[currency]) {
                numericPrice *= conversionRates[currency];
            } else {
                console.error('Unsupported currency:', currency);
                return 0; // or handle this error as appropriate
            }
        }
    
        // Round to 2 decimal places
        return Math.round(numericPrice * 100) / 100;
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const responses = await Promise.all([
                axios.post(`https://api.mouser.com/api/v1/search/partnumber?apiKey=${MOUSER_API_KEY}`, {
                    "SearchByPartRequest": {
                        "mouserPartNumber": partNumber,
                        "partSearchOptions": "string"
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }),
                axios.get(`https://www.rutronik24.com/api/search/?apikey=${RUTRONIK_API_KEY}&searchterm=${partNumber}`),
                axios.get(`https://api.element14.com//catalog/products?term=manuPartNum:${partNumber}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=${ELEMENT14_API_KEY}`)
            ]);

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
            const element14Data = (responses[2].data.manufacturerPartNumberSearchReturn.products || []).map(part => {
                const price = part.prices[0].cost; // The API returns 'cost', not 'price'
                return {
                    dataProvider: 'Element14',
                    manufacturerPartNumber: part.translatedManufacturerPartNumber, // The API uses this field for the part number
                    manufacturer: part.vendorName,
                    volume: volume,
                    unitPrice: convertToINR(price, 'USD'),
                    totalPrice: convertToINR(price, 'USD') * volume
                };
            });

            console.log(element14Data);
            console.log(rutronikData);
            console.log(mouserData);
            // handle duplicate data

            // Combine and sort results
            const allResults = [...mouserData, ...rutronikData, ...element14Data];
            allResults.sort((a, b) => a.totalPrice - b.totalPrice);
            
            setResults(allResults);
            try {
                // ... (your other API calls)
        
                const element14Response = await axios.get(`https://api.element14.com//catalog/products?term=manuPartNum:${partNumber}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=${ELEMENT14_API_KEY}`);
        
                console.log('Element14 API Response:', element14Response);
        
                // Process Element14 data
                const element14Data = (element14Response.data.manufacturerPartNumberSearchReturn.products || []).map(part => ({
                    dataProvider: 'Element14',
                    manufacturerPartNumber: part.translatedManufacturerPartNumber,
                    manufacturer: part.vendorName,
                    volume: volume,
                    unitPrice: convertToINR(part.prices[0].cost, 'USD'), // Assuming the price is in USD
                    totalPrice: convertToINR(part.prices[0].cost, 'USD') * volume
                }));
        
                console.log('Processed Element14 Data:', element14Data);
        
                // ... (process other API responses)
        
                // Combine and sort results
                const allResults = [...mouserData, ...rutronikData, ...element14Data];
                allResults.sort((a, b) => a.totalPrice - b.totalPrice);
        
                setResults(allResults);
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError(error);
            }
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

    const addToCart = (item) => {
        setCart(item);
        setIsCartOpen(true);
    };

    const updateVolume = (newVolume) => {
        if (cart) {
            const newTotalPrice = cart.unitPrice * newVolume;
            setCart({ ...cart, volume: newVolume, totalPrice: newTotalPrice });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
        <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold px-10">PartFinder</h1>
                <button onClick={() => setIsCartOpen(!isCartOpen)} className="mr-10 flex items-center bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition duration-300">
                    <FaShoppingCart className="mr-2" /> My Cart
                </button>
            </div>
        </nav>

        <div className="container mx-auto p-8 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 mx-auto w-full ">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Search Part Number</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                        <input
                            id="partNumber"
                            type="text"
                            value={partNumber}
                            onChange={(e) => setPartNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                            placeholder="Enter part number"
                        />
                    </div>
                    <div>
                        <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                        <input
                            id="volume"
                            type="number"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                            placeholder="Enter volume"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                    <FaSearch className="mr-2" /> Search
                </button>
            </div>

            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Searching for parts...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error.message}</p>
                </div>
            )}

            {results && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Part Number", "Manufacturer", "Data Provider", "Volume", "Unit Price", "Total Price", ""].map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {results.map((result, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.manufacturerPartNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.manufacturer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.dataProvider}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.volume}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{result.unitPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{result.totalPrice.toFixed(2)}</td>
                                    {index === 0 && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => addToCart(result)}
                                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
                                            >
                                                Add to Cart
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {isCartOpen && cart && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-start p-4">
                <div className="bg-white w-96 rounded-lg shadow-xl">
                    <div className="flex justify-between items-center border-b p-4">
                        <h2 className="text-xl font-semibold">My Cart</h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                            <FaTimesCircle size={24} />
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="mb-4">
                            <p><strong>Part Number:</strong> {cart.manufacturerPartNumber}</p>
                            <p><strong>Manufacturer:</strong> {cart.manufacturer}</p>
                            <p><strong>Data Provider:</strong> {cart.dataProvider}</p>
                            <p><strong>Unit Price:</strong> ₹{cart.unitPrice.toFixed(2)}</p>
                            <p><strong>Total Price:</strong> ₹{cart.totalPrice.toFixed(2)}</p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="cartVolume" className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                            <input
                                id="cartVolume"
                                type="number"
                                value={cart.volume}
                                onChange={(e) => updateVolume(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Close Cart
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

export default InputForm;
