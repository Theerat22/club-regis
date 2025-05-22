import { useState, useEffect } from "react";

export default function App() {
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState(null);
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const SHEET_ID = "1Hi_60oT8YPQkVLR68-Oi6Q3Uf4IavhlRKtb9VUqFQBA";
  const RANGE = "dashboard!A1:E24";

  useEffect(() => {
    const fetchData = () => {
      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((result) => {
          const [header, ...rows] = result.values;

          const formatted = rows.map((row) => {
            const obj = {};
            header.forEach((key, index) => {
              obj[key] = row[index];
            });
            return obj;
          });

          console.log("Formatted Clubs:", formatted);
          setClubs(formatted);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        });
    };

    fetchData();

    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [API_KEY]);

  // Function to determine status and color
  const getStatusInfo = (total, registered) => {
    const remaining = total - registered;
    if (remaining <= 0) {
      return {
        text: "เต็มแล้ว",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        rowColor: "bg-red-50",
      };
    } else if (remaining <= 2) {
      return {
        text: "เหลือน้อย",
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        rowColor: "",
      };
    } else {
      return {
        text: "เปิดรับสมัคร",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        rowColor: "",
      };
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg w-full max-w-sm">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">
            ข้อมูลชุมนุมปีการศึกษา 2568
          </h1>
        </div>

        {/* Card layout for mobile */}
        <div className="block sm:hidden space-y-4">
          {clubs.map((club, index) => {
            const total = parseInt(club["จำนวนที่รับ"] || 0);
            const registered = parseInt(club.Club_regis || 0);
            const { text, bgColor, textColor } = getStatusInfo(
              total,
              registered
            );

            const isFull = text === "เต็มแล้ว";
            const cardBgColor = isFull ? "bg-red-50" : "bg-white";

            return (
              <div
                key={index}
                className={`${cardBgColor} rounded-lg shadow-md p-4 border ${
                  isFull ? "border-red-200" : "border-gray-100"
                }`}
              >
                <h3
                  className={`text-lg font-semibold ${
                    isFull ? "text-red-800" : "text-blue-800"
                  } mb-2`}
                >
                  {club.Club_name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-500 text-md">เหลือ</p>
                    <p className="font-medium text-lg text-gray-800">
                      {club.Club_remain}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded flex items-center justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-lg font-medium ${bgColor} ${textColor} inline-block`}
                    >
                      {text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table layout for tablets and larger screens */}
        <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
              {/* Left Column */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="py-3 px-2 md:py-4 md:px-6 text-left">
                        ชื่อชุมนุม
                      </th>
                      <th className="py-3 px-2 md:py-4 md:px-6 text-center">
                        เหลือ
                      </th>
                      <th className="py-3 px-2 md:py-4 md:px-6 text-center">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clubs
                      .slice(0, Math.ceil(clubs.length / 2))
                      .map((club, index) => {
                        const total = parseInt(club["จำนวนที่รับ"] || 0);
                        const registered = parseInt(club.Club_regis || 0);
                        const { text, bgColor, textColor } = getStatusInfo(
                          total,
                          registered
                        );
                        const isFull = text === "เต็มแล้ว";
                        const customRowBg = isFull
                          ? "bg-red-50"
                          : index % 2 === 0
                          ? "bg-blue-50"
                          : "bg-white";

                        return (
                          <tr
                            key={index}
                            className={`${customRowBg} ${
                              isFull ? "text-red-800" : ""
                            }`}
                          >
                            <td
                              className={`py-3 px-4 md:py-4 md:px-6 font-medium ${
                                isFull ? "text-red-800" : "text-blue-900"
                              }`}
                            >
                              {club.Club_name}
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-6 text-center text-lg font-medium text-gray-700">
                              {club.Club_remain}
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-6 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-md font-medium ${bgColor} ${textColor}`}
                              >
                                {text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Right Column */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="py-3 px-2 md:py-4 md:px-6 text-left">
                        ชื่อชุมนุม
                      </th>
                      <th className="py-3 px-2 md:py-4 md:px-6 text-center">
                        เหลือ
                      </th>
                      <th className="py-3 px-2 md:py-4 md:px-6 text-center">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clubs
                      .slice(Math.ceil(clubs.length / 2))
                      .map((club, index) => {
                        const total = parseInt(club["จำนวนที่รับ"] || 0);
                        const registered = parseInt(club.Club_regis || 0);
                        const { text, bgColor, textColor } = getStatusInfo(
                          total,
                          registered
                        );
                        const isFull = text === "เต็มแล้ว";
                        const customRowBg = isFull
                          ? "bg-red-50"
                          : index % 2 === 0
                          ? "bg-blue-50"
                          : "bg-white";

                        return (
                          <tr
                            key={index + Math.ceil(clubs.length / 2)}
                            className={`${customRowBg} ${
                              isFull ? "text-red-800" : ""
                            }`}
                          >
                            <td
                              className={`py-3 px-4 md:py-4 md:px-6 font-medium ${
                                isFull ? "text-red-800" : "text-blue-900"
                              }`}
                            >
                              {club.Club_name}
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-6 text-center text-lg font-medium text-gray-700">
                              {club.Club_remain}
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-6 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-md font-medium ${bgColor} ${textColor}`}
                              >
                                {text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
