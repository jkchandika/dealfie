export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} VehicleOffer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
