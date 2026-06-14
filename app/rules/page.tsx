export const dynamic = 'force-dynamic';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <a href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Pool Rules & Scoring</h1>
          <p className="text-gray-600 mt-1">East Rutherford Project 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Rules Overview */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rules Overview</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Roster Budget</h3>
              <p className="text-gray-700">You have a total balance of 100 points to select your roster of teams.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Minimums</h3>
              <p className="text-gray-700">You are not required to use all 100 points, and there is no minimum number of teams required on your roster.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Limit</h3>
              <p className="text-gray-700">You cannot pick more than 10 teams total (9 Long picks + 1 optional Short pick).</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">The "Short" Option</h3>
              <p className="text-gray-700">You have the option of "shorting" one team, meaning their purchase price will be added back into your spending budget, but any points they earn during the tournament will count against your entry's points.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Duplicates</h3>
              <p className="text-gray-700">You cannot select the same team more than once in an entry.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Entries</h3>
              <p className="text-gray-700">You are welcome to submit multiple entries! Just make sure to differentiate them by entry name at the top of the sheet.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Entry Fee</h3>
              <p className="text-gray-700">$10 per entry. We will settle up via PayPal or Venmo once the tournament concludes.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Guaranteed Payouts</h3>
              <p className="text-gray-700">Final payouts depend on the number of entries, but if you finish in the top 15% (by rank), you are guaranteed to at least win your entry fee back.</p>
            </div>
          </div>
        </div>

        {/* Point System */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Point System</h2>
          
          <p className="text-gray-700 mb-6">Your roster will earn points based on wins, ties, and how far they progress in the competition:</p>

          {/* Group Phase */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-blue-600">Group Phase</h3>
            <div className="bg-gray-50 rounded p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Win</span>
                <span className="font-semibold text-gray-900">2 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tie</span>
                <span className="font-semibold text-gray-900">1 point</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">1st place in group</span>
                <span className="font-semibold text-gray-900">3 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">2nd place in group</span>
                <span className="font-semibold text-gray-900">1 point</span>
              </div>
            </div>
          </div>

          {/* Knockout Phase */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-blue-600">Knockout Phase</h3>
            <div className="bg-gray-50 rounded p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Round of 32 win</span>
                <span className="font-semibold text-gray-900">3 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Round of 16 win</span>
                <span className="font-semibold text-gray-900">4 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Quarterfinal win</span>
                <span className="font-semibold text-gray-900">5 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Semifinal win</span>
                <span className="font-semibold text-gray-900">6 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">3rd place winner</span>
                <span className="font-semibold text-gray-900">1 point</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">World Cup champion</span>
                <span className="font-semibold text-gray-900 text-lg">7 points</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
