// import React, { useState } from 'react';
// import axios from 'axios';

// const InputForm = () => {
//     const [partNumber, setPartNumber] = useState('');
//     const [volume, setVolume] = useState('');
//     const [results, setResults] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const convertToINR = (price, currency) => {
//         const rates = {
//             USD: 84, // Example rate for USD to INR
//             EUR: 90, // Example rate for EUR to INR
//             INR: 1   // Conversion rate for INR to INR is 1
//         };
//         const rate = rates[currency] || 1; // Default to 1 if currency is not found
//         // Extract numeric value from price if it's formatted with currency symbol
//         const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
//         return numericPrice * rate;
//     };

//     const fetchData = async () => {
//         setLoading(true);
//         setError(null);

//         try {
//             const responses = await Promise.all([
//                 axios.post('https://api.mouser.com/api/v1/search/partnumber?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560', {
//                     "SearchByPartRequest": {
//                         "mouserPartNumber": partNumber,
//                         "partSearchOptions": "string"
//                     }
//                 }, {
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 }),
//                 axios.get(`https://www.rutronik24.com/api/search/?apikey=cc6qyfg2yfis&searchterm=${partNumber}`),
//                 axios.get(`http://api.element14.com//catalog/products?term=manuPartNum:${partNumber}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=wb9wt295qf3g6m842896hh2u`)
//             ]);

//             // Log responses
//             console.log('Mouser Response:', responses[0].data);
//             console.log('Rutronik Response:', responses[1].data);
//             console.log('Element14 Response:', responses[2].data);

//             // Process Mouser data
//             const mouserData = (responses[0].data.SearchResults.Parts || []).map(part => ({
//                 dataProvider: 'Mouser',
//                 manufacturerPartNumber: part.MouserPartNumber,
//                 manufacturer: part.Manufacturer,
//                 volume: volume,
//                 unitPrice: convertToINR(part.PriceBreaks[0].Price, part.PriceBreaks[0].Currency),
//                 totalPrice: convertToINR(part.PriceBreaks[0].Price, part.PriceBreaks[0].Currency) * volume
//             }));

//             // Process Rutronik data
//             const rutronikData = (responses[1].data || []).map(part => ({
//                 dataProvider: 'Rutronik',
//                 manufacturerPartNumber: part.mpn,
//                 manufacturer: part.manufacturer,
//                 volume: volume,
//                 unitPrice: convertToINR(part.price, part.currency),
//                 totalPrice: convertToINR(part.price, part.currency) * volume
//             }));

//             // Process Element14 data
//             const element14Data = (responses[2].data.products || []).map(part => ({
//                 dataProvider: 'Element14',
//                 manufacturerPartNumber: part.sku, // Assuming SKU is the part number
//                 manufacturer: part.vendorName,
//                 volume: volume,
//                 unitPrice: convertToINR(part.prices[0].price, 'USD'), // Assuming the first price is the relevant one
//                 totalPrice: convertToINR(part.prices[0].price, 'USD') * volume
//             }));

//             // Combine and sort results
//             const allResults = [...mouserData, ...rutronikData, ...element14Data];
//             allResults.sort((a, b) => a.totalPrice - b.totalPrice);

//             setResults(allResults);
//         } catch (error) {
//             setError(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSubmit = () => {
//         if (partNumber && volume) {
//             fetchData();
//         } else {
//             setError(new Error('Please enter both part number and volume'));
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//             <div className="p-8 bg-white rounded shadow-md w-full max-w-4xl">
//                 <h2 className="text-lg font-semibold mb-6 text-center">Search Part Number</h2>
//                 <div className="mb-4">
//                     <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700">Part Number</label>
//                     <input
//                         id="partNumber"
//                         type="text"
//                         value={partNumber}
//                         onChange={(e) => setPartNumber(e.target.value)}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label htmlFor="volume" className="block text-sm font-medium text-gray-700">Volume</label>
//                     <input
//                         id="volume"
//                         type="number"
//                         value={volume}
//                         onChange={(e) => setVolume(Number(e.target.value))}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                     />
//                 </div>
//                 <button
//                     type="button"
//                     onClick={handleSubmit}
//                     className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                 >
//                     Search
//                 </button>
//                 {loading && <p className="mt-4 text-center text-gray-500">Loading...</p>}
//                 {error && <p className="mt-4 text-center text-red-500">Error: {error.message}</p>}
//                 {results && (
//                     <div className="mt-4">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Provider</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (At the given volume)</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price (Unit Price * Volume)</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {results.map((result, index) => (
//                                     <tr key={index}>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.manufacturerPartNumber}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.manufacturer}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.dataProvider}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.volume}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.unitPrice.toFixed(2)} INR</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.totalPrice.toFixed(2)} INR</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default InputForm;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaSearch, FaTimesCircle } from 'react-icons/fa';

const InputForm = () => {
    const [partNumber, setPartNumber] = useState('');
    const [volume, setVolume] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const convertToINR = (price, currency) => {
        const rates = {
            USD: 84, // Example rate for USD to INR
            EUR: 90, // Example rate for EUR to INR
            INR: 1   // Conversion rate for INR to INR is 1
        };
        const rate = rates[currency] || 1; // Default to 1 if currency is not found
        const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
        return numericPrice * rate;
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
                    <h1 className="text-2xl font-bold">PartFinder Pro</h1>
                    <button onClick={() => setIsCartOpen(!isCartOpen)} className="flex items-center bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition duration-300">
                        <FaShoppingCart className="mr-2" /> My Cart
                    </button>
                </div>
            </nav>

            <div className="container mx-auto p-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Search Part Number</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                            <input
                                id="partNumber"
                                type="text"
                                value={partNumber}
                                onChange={(e) => setPartNumber(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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

//     return (
//         <div className="min-h-screen flex flex-col items-center bg-gray-100">
//             <nav className="w-full bg-blue-500 text-white p-4 flex justify-between items-center">
//                 <h1 className="text-lg font-semibold">Part Search</h1>
//                 <button onClick={() => setIsCartOpen(!isCartOpen)} className="flex items-center">
//                     <FaShoppingCart className="mr-2" /> My Cart
//                 </button>
//             </nav>
//             <div className="p-8 bg-white rounded shadow-md w-full max-w-4xl mt-4">
//                 <h2 className="text-lg font-semibold mb-6 text-center">Search Part Number</h2>
//                 <div className="mb-4">
//                     <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700">Part Number</label>
//                     <input
//                         id="partNumber"
//                         type="text"
//                         value={partNumber}
//                         onChange={(e) => setPartNumber(e.target.value)}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label htmlFor="volume" className="block text-sm font-medium text-gray-700">Volume</label>
//                     <input
//                         id="volume"
//                         type="number"
//                         value={volume}
//                         onChange={(e) => setVolume(Number(e.target.value))}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                     />
//                 </div>
//                 <button
//                     type="button"
//                     onClick={handleSubmit}
//                     className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                 >
//                     Search
//                 </button>
//                 {loading && <p className="mt-4 text-center text-gray-500">Loading...</p>}
//                 {error && <p className="mt-4 text-center text-red-500">Error: {error.message}</p>}
//                 {results && (
//                     <div className="mt-4 overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Provider</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (At the given volume)</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price (Unit Price * Volume)</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {results.map((result, index) => (
//                                     <tr key={index}>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.manufacturerPartNumber}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.manufacturer}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.dataProvider}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.volume}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.unitPrice.toFixed(2)}</td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.totalPrice.toFixed(2)}</td>
//                                         {index === 0 && (
//                                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                                 <button
//                                                     onClick={() => addToCart(result)}
//                                                     className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
//                                                 >
//                                                     Add to Cart
//                                                 </button>
//                                             </td>
//                                         )}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//             {isCartOpen && cart && (
//                 <div className="fixed inset-0 flex justify-end">
//                     <div className="bg-white w-80 p-4 shadow-lg">
//                         <h2 className="text-xl font-semibold mb-4">My Cart</h2>
//                         <div className="mb-2">
//                             <p><strong>Part Number:</strong> {cart.manufacturerPartNumber}</p>
//                             <p><strong>Manufacturer:</strong> {cart.manufacturer}</p>
//                             <p><strong>Data Provider:</strong> {cart.dataProvider}</p>
//                             <p><strong>Unit Price:</strong> {cart.unitPrice.toFixed(2)}</p>
//                             <p><strong>Total Price:</strong> {cart.totalPrice.toFixed(2)}</p>
//                         </div>
//                         <div className="mb-4">
//                             <label htmlFor="cartVolume" className="block text-sm font-medium text-gray-700">Volume</label>
//                             <input
//                                 id="cartVolume"
//                                 type="number"
//                                 value={cart.volume}
//                                 onChange={(e) => updateVolume(Number(e.target.value))}
//                                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                             />
//                         </div>
//                         <button
//                             onClick={() => setIsCartOpen(false)}
//                             className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
//                         >
//                             Close Cart
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

export default InputForm;
