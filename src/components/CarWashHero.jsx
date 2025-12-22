export default function CarWashHero({ teamName, description }) {
  return (
    <div className="relative bg-teal-50 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-800 mb-4">
          {teamName}
        </h1>
        <p className="text-lg sm:text-xl text-teal-700/80 mb-6">{description}</p>
        <div className="inline-flex gap-4">
          <button className="bg-teal-800 text-white px-6 py-2 rounded-xl font-medium hover:bg-teal-700 transition-colors">
            View Team
          </button>
          <button className="bg-white border border-teal-800 text-teal-800 px-6 py-2 rounded-xl font-medium hover:bg-teal-100 transition-colors">
            Invite Members
          </button>
        </div>
      </div>
      {/* Optional accent graphics */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-teal-100 rounded-full opacity-30 -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-teal-200 rounded-full opacity-20 translate-x-1/4 translate-y-1/4"></div>
    </div>
  );
}
