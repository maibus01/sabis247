import React from "react";
import { Phone, Calendar, Clock, Car } from "lucide-react";
import Header from "../components/Header";
import BottomNavbar from "../components/BottomNavbar"
//import CarWashHero from "../components/CarWashHero";

export default function OwnerBookings() {
  // MOCK DATA (design only)
  const bookings = [
    {
      id: 1,
      customerName: "John Doe",
      phone: "+1 555 123 456",
      service: "Full Car Wash",
      date: "2025-02-10",
      time: "10:30 AM",
      status: "pending",
    },
    {
      id: 2,
      customerName: "Sarah Smith",
      phone: "+1 555 987 654",
      service: "Interior Cleaning",
      date: "2025-02-10",
      time: "1:00 PM",
      status: "approved",
    },
    {
      id: 3,
      customerName: "Mike Johnson",
      phone: "+1 555 333 222",
      service: "Premium Wash",
      date: "2025-02-09",
      time: "4:00 PM",
      status: "completed",
    },
  ];

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <>
      <Header />
      {/* <CarWashHero /> */}
      <div className="max-w-7xl mx-auto p-6 py-28">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
          <p className="text-gray-500 mt-1">
            Customer orders & scheduled services
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col gap-4"
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-800">
                  {b.customerName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    statusStyles[b.status]
                  }`}
                >
                  {b.status}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Car size={16} />
                  <span>{b.service}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{b.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{b.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>{b.phone}</span>
                </div>
              </div>

              {/* Actions (design only) */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 text-sm bg-hybriflow-dark-teal text-white rounded-lg hover:opacity-90 transition">
                  View
                </button>
                <button className="flex-1 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}
