// File: pages/transcriptions.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PhoneCall, BarChart2, FileText, Shield, ArrowRight, TrendingUp, MessageCircle, Volume2, Zap, AlertCircle, Target, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import Header from './components/header';
import Footer from './components/footer';

// Analysis Card Component
const AnalysisCard = ({ title, icon: Icon, detail, positive, negative, suggested1, suggested2, score, color }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {score && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
            {score}/10
          </div>
        )}
      </div>
      
      {detail && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">{detail}</p>
        </div>
      )}
      
      <div className="space-y-3">
        {positive && (
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{positive}</p>
          </div>
        )}
        
        {negative && (
          <div className="flex items-start space-x-2">
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{negative}</p>
          </div>
        )}
        
        {(suggested1 || suggested2) && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-800">Suggestions</span>
            </div>
            <div className="space-y-2">
              {suggested1 && (
                <p className="text-sm text-gray-700 pl-6">• {suggested1}</p>
              )}
              {suggested2 && (
                <p className="text-sm text-gray-700 pl-6">• {suggested2}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Recap Section Component
const RecapSection = ({ title, point1, point2 }) => {
  if (!point1 && !point2) return null;
  
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
      <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
      <div className="space-y-1">
        {point1 && <p className="text-sm text-gray-700">• {point1}</p>}
        {point2 && <p className="text-sm text-gray-700">• {point2}</p>}
      </div>
    </div>
  );
};

export default function Transcriptions() {
  const router = useRouter();
  const [data, setData] = useState({ headers: [], table_data: [] });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    setPage(currentPage);
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transcriptions?page=${currentPage}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
        console.log(json)
      }
    )
      .catch(err => {
        console.error("Failed to fetch transcriptions:", err);
        setLoading(false);
      });
  }, [page]);

  const goToPage = (newPage) => {
    router.push(`/transcriptions?page=${newPage}`);
    setPage(newPage);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Helper function to get data by header name
  const getDataByHeader = (row, headerName) => {
    const headerIndex = data.headers.findIndex(h => h.toLowerCase().includes(headerName.toLowerCase()));
    return headerIndex !== -1 ? row[headerIndex] : null;
  };

  // Filter basic table headers (non-analysis data)
  const basicHeaders = data.headers.filter(header => {
    const lowerHeader = header.toLowerCase();
    return !lowerHeader.includes('pitch_followed') &&
           !lowerHeader.includes('confidence') &&
           !lowerHeader.includes('tonality') &&
           !lowerHeader.includes('energy') &&
           !lowerHeader.includes('objection') &&
           !lowerHeader.includes('strengths') &&
           !lowerHeader.includes('areas_for_improvement') &&
           !lowerHeader.includes('recap') &&
           !lowerHeader.includes('score');
  });

  // Get basic table data (filtered)
  const getBasicRowData = (row) => {
    return basicHeaders.map(header => {
      const originalIndex = data.headers.indexOf(header);
      return row[originalIndex];
    });
  };

  // Get analysis data for a specific row
  const getAnalysisData = (row) => {
    return {
      pitch: {
        detail: getDataByHeader(row, 'pitch_followed_detail'),
        positive: getDataByHeader(row, 'pitch_followed_positive'),
        negative: getDataByHeader(row, 'pitch_followed_negative'),
        suggested1: getDataByHeader(row, 'pitch_followed_suggested_1'),
        suggested2: getDataByHeader(row, 'pitch_followed_suggested_2'),
        score: getDataByHeader(row, 'score_pitch')
      },
      confidence: {
        detail: getDataByHeader(row, 'confidence_detail'),
        positive: getDataByHeader(row, 'confidence_positive'),
        negative: getDataByHeader(row, 'confidence_negative'),
        suggested1: getDataByHeader(row, 'confidence_suggested_1'),
        suggested2: getDataByHeader(row, 'confidence_suggested_2'),
        score: getDataByHeader(row, 'score_confidence')
      },
      tonality: {
        detail: getDataByHeader(row, 'tonality_detail'),
        positive: getDataByHeader(row, 'tonality_positive'),
        negative: getDataByHeader(row, 'tonality_negative'),
        suggested1: getDataByHeader(row, 'tonality_suggested_1'),
        suggested2: getDataByHeader(row, 'tonality_suggested_2'),
        score: getDataByHeader(row, 'score_tonality')
      },
      energy: {
        detail: getDataByHeader(row, 'energy_detail'),
        positive: getDataByHeader(row, 'energy_positive'),
        negative: getDataByHeader(row, 'energy_negative'),
        suggested1: getDataByHeader(row, 'energy_suggested_1'),
        suggested2: getDataByHeader(row, 'energy_suggested_2'),
        score: getDataByHeader(row, 'score_energy')
      },
      objection: {
        detail: getDataByHeader(row, 'objection_detail'),
        positive: getDataByHeader(row, 'objection_positive'),
        negative: getDataByHeader(row, 'objection_negative'),
        suggested1: getDataByHeader(row, 'objection_suggested_1'),
        suggested2: getDataByHeader(row, 'objection_suggested_2'),
        score: getDataByHeader(row, 'score_objection')
      },
      strengths: getDataByHeader(row, 'strengths'),
      areasForImprovement: getDataByHeader(row, 'areas_for_improvement'),
      overallScore: getDataByHeader(row, 'score_overall'),
      recap: {
        pitch1: getDataByHeader(row, 'recap_pitch_1'),
        pitch2: getDataByHeader(row, 'recap_pitch_2'),
        confidence1: getDataByHeader(row, 'recap_confidence_1'),
        confidence2: getDataByHeader(row, 'recap_confidence_2'),
        tonality1: getDataByHeader(row, 'recap_tonality_1'),
        tonality2: getDataByHeader(row, 'recap_tonality_2'),
        energy1: getDataByHeader(row, 'recap_energy_1'),
        energy2: getDataByHeader(row, 'recap_energy_2'),
        objection1: getDataByHeader(row, 'recap_objection_1'),
        objection2: getDataByHeader(row, 'recap_objection_2'),
      }
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <Head>
        <title>Sales Call Analyzer | Transcription</title>
        <meta name="description" content="Upload, transcribe, and analyze your sales calls with advanced AI analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Audio Transcriptions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            View and manage your audio transcription history with detailed analysis
          </p>
        </div>

        {/* Basic Information Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Transcription Records</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                <div className="space-y-4">
                  <div className="h-4 w-36 bg-gradient-to-r from-indigo-200 to-purple-200 rounded"></div>
                  <div className="h-4 w-24 bg-gradient-to-r from-indigo-200 to-purple-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
                    <tr>
                      {basicHeaders.map((header, idx) => (
                        <th 
                          key={idx} 
                          className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.table_data.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex} 
                        className="hover:bg-indigo-50 transition duration-200"
                      >
                        {getBasicRowData(row).map((cell, cellIndex) => (
                          <td 
                            key={cellIndex} 
                            className="px-6 py-4 text-sm text-gray-700"
                          >
                            {cell}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedRow(selectedRow === rowIndex ? null : rowIndex)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors duration-200"
                          >
                            {selectedRow === rowIndex ? 'Hide Analysis' : 'View Analysis'}
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.table_data.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No transcriptions found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Analysis Section */}
        {selectedRow !== null && data.table_data[selectedRow] && (
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Call Analysis</h2>
              {getAnalysisData(data.table_data[selectedRow]).overallScore && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">Overall Score:</span>
                  <div className="px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    {getAnalysisData(data.table_data[selectedRow]).overallScore}/10
                  </div>
                </div>
              )}
            </div>

            {(() => {
              const analysisData = getAnalysisData(data.table_data[selectedRow]);
              
              return (
                <>
                  {/* Analysis Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <AnalysisCard
                      title="Pitch Quality"
                      icon={Target}
                      color="bg-gradient-to-r from-blue-500 to-blue-600"
                      {...analysisData.pitch}
                    />
                    <AnalysisCard
                      title="Confidence Level"
                      icon={TrendingUp}
                      color="bg-gradient-to-r from-green-500 to-green-600"
                      {...analysisData.confidence}
                    />
                    <AnalysisCard
                      title="Tonality"
                      icon={MessageCircle}
                      color="bg-gradient-to-r from-purple-500 to-purple-600"
                      {...analysisData.tonality}
                    />
                    <AnalysisCard
                      title="Energy Level"
                      icon={Zap}
                      color="bg-gradient-to-r from-yellow-500 to-orange-500"
                      {...analysisData.energy}
                    />
                    <AnalysisCard
                      title="Objection Handling"
                      icon={AlertCircle}
                      color="bg-gradient-to-r from-red-500 to-red-600"
                      {...analysisData.objection}
                    />
                  </div>

                  {/* Summary Section */}
                  {(analysisData.strengths || analysisData.areasForImprovement) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {analysisData.strengths && (
                        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-green-800">Strengths</h3>
                          </div>
                          <p className="text-green-700">{analysisData.strengths}</p>
                        </div>
                      )}
                      
                      {analysisData.areasForImprovement && (
                        <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <Lightbulb className="h-5 w-5 text-amber-600" />
                            <h3 className="text-lg font-semibold text-amber-800">Areas for Improvement</h3>
                          </div>
                          <p className="text-amber-700">{analysisData.areasForImprovement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recap Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Takeaways</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <RecapSection 
                        title="Pitch Recap" 
                        point1={analysisData.recap.pitch1} 
                        point2={analysisData.recap.pitch2} 
                      />
                      <RecapSection 
                        title="Confidence Recap" 
                        point1={analysisData.recap.confidence1} 
                        point2={analysisData.recap.confidence2} 
                      />
                      <RecapSection 
                        title="Tonality Recap" 
                        point1={analysisData.recap.tonality1} 
                        point2={analysisData.recap.tonality2} 
                      />
                      <RecapSection 
                        title="Energy Recap" 
                        point1={analysisData.recap.energy1} 
                        point2={analysisData.recap.energy2} 
                      />
                      <RecapSection 
                        title="Objection Handling Recap" 
                        point1={analysisData.recap.objection1} 
                        point2={analysisData.recap.objection2} 
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 space-x-2">
          {page > 1 && (
            <button
              onClick={() => goToPage(page - 1)}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Previous
            </button>
          )}
          
          <div className="px-4 py-2 rounded-lg border border-gray-200 bg-white">
            <p className="font-medium text-gray-700">Page {page}</p>
          </div>
          
          <button
            onClick={() => goToPage(page + 1)}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}