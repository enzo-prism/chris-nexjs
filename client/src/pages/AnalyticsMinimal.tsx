import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, TrendingUp, Clock, ChevronRight, Menu, X, ChevronDown, Activity
} from "lucide-react";
import MetaTags from "@/components/common/MetaTags";
import { julyAnalyticsData } from "@/data/analytics-july-2025";
import { augustAnalyticsData } from "@/data/analytics-august-2025";
import { cn } from "@/lib/utils";

// Minimalistic color palette
const COLORS = {
  primary: '#000000',
  secondary: '#666666',
  muted: '#999999',
  border: '#e5e5e5',
  background: '#fafafa',
  accent: '#000000',
  chart: ['#000000', '#333333', '#666666', '#999999', '#cccccc']
};

// Month data mapping
const monthsData = {
  "july": julyAnalyticsData,
  "august": augustAnalyticsData
};

const availableMonths = [
  { value: "july", label: "July 2025", emoji: "📊", status: "complete" },
  { value: "august", label: "August 2025", emoji: "📈", status: "in_progress" }
];

// Navigation sections with emojis
const sections = [
  { value: "overview", label: "Overview", emoji: "🎯" },
  { value: "acquisition", label: "Acquisition", emoji: "👥" },
  { value: "behavior", label: "Behavior", emoji: "📱" },
  { value: "search", label: "Search", emoji: "🔍" },
  { value: "reputation", label: "Reputation", emoji: "⭐" },
  { value: "highlights", label: "Highlights", emoji: "✨" },
  { value: "targets", label: "Targets", emoji: "🎯" }
];

// Minimalistic metric card
function MetricCard({ 
  label, 
  value, 
  trend, 
  emoji,
  description,
  className 
}: { 
  label: string; 
  value: string | number; 
  trend?: string;
  emoji?: string;
  description?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 hover:border-gray-200 transition-all",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          {emoji && <span className="text-base">{emoji}</span>}
        </div>
        <p className="text-xl lg:text-2xl font-semibold text-gray-900">{value}</p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500">{trend}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Password dialog with minimal design
function PasswordDialog({ open, onOpenChange, onAuthenticate }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onAuthenticate: () => void; 
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "chris") {
      onAuthenticate();
      onOpenChange(false);
      setError("");
      setPassword("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-3xl border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            🔐 Analytics Access
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus:border-gray-400"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-black hover:bg-gray-800 text-white"
          >
            Access Dashboard
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Analytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("july");

  // Check for existing session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("analytics-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      setShowPasswordDialog(true);
    }
  }, []);
  
  // Get current month data with type safety
  const data = monthsData[selectedMonth as keyof typeof monthsData] as any;
  const isInProgress = selectedMonth === "august";

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("analytics-auth", "true");
  };

  // Format acquisition data for charts
  const acquisitionData = !isInProgress && data.acquisition?.firstTimeUsers 
    ? Object.entries(data.acquisition.firstTimeUsers).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        value: value,
        fullName: key
      }))
    : [];

  if (!isAuthenticated) {
    return (
      <>
        <MetaTags 
          title="Analytics Dashboard - Access Required"
          description="Secure analytics dashboard for practice performance"
        />
        <PasswordDialog 
          open={showPasswordDialog} 
          onOpenChange={setShowPasswordDialog}
          onAuthenticate={handleAuthenticate}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-lg rounded-3xl">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-xl font-medium mb-2">Analytics Dashboard</h2>
              <p className="text-sm text-gray-500 mb-6">Authentication required to access</p>
              <Button 
                onClick={() => setShowPasswordDialog(true)}
                className="w-full h-12 rounded-xl bg-black hover:bg-gray-800 text-white"
              >
                Enter Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTags 
        title={`Analytics Dashboard | ${availableMonths.find(m => m.value === selectedMonth)?.label}`}
        description="Practice performance analytics and insights"
        robots="noindex, nofollow, noarchive"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block w-64 bg-white border-r border-gray-100 fixed h-full z-40"
        )}>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl font-semibold mb-4">📊 Analytics</h1>
              
              {/* Month Selector */}
              <div className="space-y-1">
                {availableMonths.map((month) => (
                  <button
                    key={month.value}
                    onClick={() => setSelectedMonth(month.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm",
                      selectedMonth === month.value
                        ? "bg-gray-900 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{month.emoji}</span>
                      <span>{month.label}</span>
                    </span>
                    {month.status === "in_progress" && (
                      <span className="text-xs opacity-60">Live</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Navigation */}
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.value}
                  onClick={() => setSelectedSection(section.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm",
                    selectedSection === section.value 
                      ? "bg-gray-100 font-medium" 
                      : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  <span className="text-base">{section.emoji}</span>
                  <span>{section.label}</span>
                  {selectedSection === section.value && (
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  )}
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            {!isInProgress && (
              <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">New Users</span>
                    <span className="text-sm font-semibold">{data.executive?.newUsers?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Avg Session</span>
                    <span className="text-sm font-semibold">{data.executive?.avgSessionDuration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Bounce Rate</span>
                    <span className="text-sm font-semibold">{data.executive?.bounceRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-semibold">📊 Analytics</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-xl"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Month Selector */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full h-10 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    <div className="flex items-center gap-2">
                      <span>{month.emoji}</span>
                      <span>{month.label}</span>
                      {month.status === "in_progress" && (
                        <span className="text-xs text-gray-400 ml-1">Live</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile Section Tabs */}
            <ScrollArea className="w-full mt-3">
              <div className="flex gap-2">
                {sections.map((section) => (
                  <Button
                    key={section.value}
                    variant={selectedSection === section.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection(section.value)}
                    className="rounded-xl whitespace-nowrap"
                  >
                    <span className="mr-1">{section.emoji}</span>
                    <span className="hidden sm:inline">{section.label}</span>
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black z-40"
              />
	              <motion.aside
	                initial={{ x: -300 }}
	                animate={{ x: 0 }}
	                exit={{ x: -300 }}
	                className="lg:hidden fixed left-0 top-0 h-full w-64 sm:w-72 max-w-[85vw] bg-white z-50 shadow-xl"
	              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-xl"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.value}
                        onClick={() => {
                          setSelectedSection(section.value);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm",
                          selectedSection === section.value 
                            ? "bg-gray-100 font-medium" 
                            : "hover:bg-gray-50"
                        )}
                      >
                        <span>{section.emoji}</span>
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-28 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Coming Soon State */}
            {isInProgress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="border-0 shadow-sm rounded-3xl bg-gradient-to-br from-gray-50 to-white">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">📈</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">August Analytics Coming Soon</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Real-time data collection in progress. Analytics are being actively measured and will be available soon.
                        </p>
                        
                        {/* Early Indicators */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Early Indicators</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">🟢</span>
                              <span className="text-sm text-gray-700">Organic search growth continuing</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">📱</span>
                              <span className="text-sm text-gray-700">Mobile traffic trending upward</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">📈</span>
                              <span className="text-sm text-gray-700">Patient inquiries +15% vs July</span>
                            </div>
                          </div>
                        </div>

                        {/* Coming Features */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                            ⚡ Real-Time Updates
                          </Badge>
                          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                            🤖 AI Insights
                          </Badge>
                          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                            📊 Competitor Analysis
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Overview Section */}
            {selectedSection === "overview" && !isInProgress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">July Overview</h2>
                  <p className="text-sm text-gray-600">{data.executive?.summary}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                  <MetricCard 
                    label="New Users" 
                    value={data.executive?.newUsers?.toLocaleString() || '0'}
                    trend="+12% from June"
                    emoji="👥"
                  />
                  <MetricCard 
                    label="Returning" 
                    value={data.executive?.returningUsers || '0'}
                    emoji="🔄"
                  />
                  <MetricCard 
                    label="Mobile" 
                    value={`${data.executive?.mobileShare || 0}%`}
                    emoji="📱"
                  />
                  <MetricCard 
                    label="Session" 
                    value={data.executive?.avgSessionDuration || '0:00'}
                    emoji="⏱️"
                  />
                  <MetricCard 
                    label="Pages" 
                    value={data.executive?.pagesPerSession || '0'}
                    emoji="📄"
                  />
                  <MetricCard 
                    label="Bounce" 
                    value={`${data.executive?.bounceRate || 0}%`}
                    trend="down 3%"
                    emoji="📉"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Traffic Sources */}
                  <Card className="border-0 shadow-sm rounded-3xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <span>🌐</span> Traffic Sources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={acquisitionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {acquisitionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e5e5',
                                borderRadius: '12px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {acquisitionData.slice(0, 4).map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }}
                            />
                            <span className="text-xs text-gray-600">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Pages */}
                  <Card className="border-0 shadow-sm rounded-3xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <span>📊</span> Top Pages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.behavior?.topPages?.slice(0, 5).map((page: any, index: number) => (
                          <div key={page.page} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                              <span className="text-sm font-medium">{page.page}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-20 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                                <div 
                                  className="bg-gray-900 h-1.5 rounded-full"
                                  style={{ width: `${(page.sessions / 100) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold">{page.sessions}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Other sections with minimal design */}
            {selectedSection === "acquisition" && !isInProgress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">👥 User Acquisition</h2>
                  <p className="text-sm text-gray-600">How users discover your practice</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 border-0 shadow-sm rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Channel Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.acquisition?.sessionsBySource || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                            <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#999' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#999' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e5e5',
                                borderRadius: '12px'
                              }}
                            />
                            <Bar dataKey="sessions" fill="#000000" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card className="border-0 shadow-sm rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-base font-medium">🏙️ Top Cities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {data.acquisition?.topCities?.slice(0, 5).map((city: string) => (
                            <div key={city} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                              <span className="text-xs">📍</span>
                              <span className="text-sm">{city}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Behavior Section */}
            {selectedSection === "behavior" && !isInProgress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">📱 User Behavior</h2>
                  <p className="text-sm text-gray-600">{data.behavior?.insight}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <MetricCard 
                    label="Session Duration" 
                    value={data.behavior?.metrics?.avgSessionDuration || '0:00'}
                    emoji="⏱️"
                  />
                  <MetricCard 
                    label="Pages/Session" 
                    value={data.behavior?.metrics?.pagesPerSession || '0'}
                    emoji="📄"
                  />
                  <MetricCard 
                    label="Bounce Rate" 
                    value={`${data.behavior?.metrics?.bounceRate || 0}%`}
                    emoji="📉"
                  />
                  <MetricCard 
                    label="Scroll Depth" 
                    value={`${data.behavior?.metrics?.avgScrollDepth || 0}%`}
                    emoji="📜"
                  />
                </div>

                <Card className="border-0 shadow-sm rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-base font-medium">🖱️ Top Click Elements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.behavior?.topClicks?.map((click: any, index: number) => (
                        <div key={click.element} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-sm font-medium">{click.element}</span>
                          <Badge variant="outline" className="rounded-full">
                            {click.clicks} clicks
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Search Section */}
            {selectedSection === "search" && !isInProgress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">🔍 Search Performance</h2>
                  <p className="text-sm text-gray-600">{data.searchVisibility?.insight}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">🔗 Top Landing Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.searchVisibility?.landingPagesByImpressions?.map((page: any, index: number) => (
                          <div key={page.page} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs text-gray-500 font-mono">{page.page}</span>
                              <Badge variant="outline" className="rounded-full text-xs">
                                {page.impressions.toLocaleString()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">🔤 Top Search Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.searchVisibility?.queriesByClicks?.map((query: any) => (
                          <div key={query.query} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{query.query}</span>
                              <span className="text-xs font-semibold">{query.clicks} clicks</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Reputation Section */}
            {selectedSection === "reputation" && !isInProgress && data.reputation?.july && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">⭐ Online Reputation</h2>
                  <p className="text-sm text-gray-600">Building trust through patient reviews</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MetricCard 
                    label="July Reviews" 
                    value={data.reputation.july.newReviewsCount}
                    emoji="⭐"
                    description={`Google: ${data.reputation.july.platformBreakdown.google}, Yelp: ${data.reputation.july.platformBreakdown.yelp}`}
                  />
                  <MetricCard 
                    label="Average Rating" 
                    value={data.reputation.july.avgRatingNew.toFixed(1)}
                    emoji="🌟"
                    description="5-star scale"
                  />
                  <MetricCard 
                    label="August Preview" 
                    value={data.reputation.previewAug.newReviewsCount}
                    emoji="📈"
                    description="Already incoming"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.reputation.july.topQuotes.map((quote: any, index: number) => (
                    <Card key={index} className="border-0 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💬</span>
                          <div className="flex-1">
                            <p className="text-sm italic text-gray-700 mb-3">"{quote.excerpt}"</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{quote.source} • {quote.date}</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="text-xs">⭐</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Highlights Section */}
            {selectedSection === "highlights" && !isInProgress && data.highlights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">✨ July Achievements</h2>
                  <p className="text-sm text-gray-600">Key accomplishments and delivered value</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.highlights.map((highlight: any, index: number) => (
                    <Card key={index} className="border-0 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                              <h4 className="font-medium">{highlight.title}</h4>
                              <Badge 
                                variant={highlight.status === 'complete' ? "default" : "secondary"}
                                className="mt-1 rounded-full text-xs"
                              >
                                {highlight.status === 'complete' ? '✓ Complete' : '⏳ In Progress'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{highlight.impact}</p>
                        
                        <div className="space-y-1">
                          {highlight.evidence.map((item: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-xs mt-0.5">✓</span>
                              <span className="text-xs text-gray-500">{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Targets Section */}
            {selectedSection === "targets" && !isInProgress && data.targetsNextMonth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">🎯 August Targets</h2>
                  <p className="text-sm text-gray-600">Priority actions for continued growth</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.targetsNextMonth.map((target: any) => (
                    <Card key={target.priority} className="border-0 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                            {target.priority}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">{target.title}</h4>
                            <p className="text-sm text-gray-600">{target.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
