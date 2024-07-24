import React, { useState } from 'react';

const InputForm = () => {
    const [partNumber, setPartNumber] = useState('');
    const [volume, setVolume] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const data = JSON.stringify({
            "SearchByPartRequest": {
                "mouserPartNumber": partNumber,
                "partSearchOptions": "string"
            }
        });

        try {
            const response = await fetch('https://api.mouser.com/api/v1/search/partnumber?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': 'ASP.NET_SessionId=ks3o1nmkxwjminp2o5dcyek3; preferences='
                },
                body: data
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            setResults(responseData.SearchResults.Parts);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-6 text-center">Problem 1</h2>
                <div className="mb-4">
                    <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700">PART NUMBER</label>
                    <input
                        id="partNumber"
                        type="text"
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="volume" className="block text-sm font-medium text-gray-700">VOLUME</label>
                    <input
                        id="volume"
                        type="text"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    ENTER
                </button>
                {loading && <p className="mt-4 text-center text-gray-500">Loading...</p>}
                {error && <p className="mt-4 text-center text-red-500">Error: {error.message}</p>}
                {results && (
                    <div className="mt-4">
                        {results.map((part, index) => (
                            <div key={index} className="border p-4 mb-2 rounded-md shadow-sm">
                                <h3 className="text-lg font-semibold">{part.Description}</h3>
                                <p>Manufacturer: {part.Manufacturer}</p>
                                <p>Price: {part.PriceBreaks[0].Price} {part.PriceBreaks[0].Currency}</p>
                                <a href={part.ProductDetailUrl} className="text-blue-500" target="_blank" rel="noopener noreferrer">More Details</a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputForm;
