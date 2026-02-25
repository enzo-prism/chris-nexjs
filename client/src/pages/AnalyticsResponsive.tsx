import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, Users, TrendingUp, Eye, Target, Globe, Clock, Star, 
  CheckCircle2, AlertCircle, MapPin, Zap, ChevronRight, Menu, X,
  BarChart3, Search, Award, MessageSquare, Smartphone, Monitor,
  TrendingDown, Activity, FileText, DollarSign, ChevronUp
} from "lucide-react";
import MetaTags from "@/components/common/MetaTags";
import { julyAnalyticsData } from "@/data/analytics-july-2025";
import { augustAnalyticsData } from "@/data/analytics-august-2025";
import { cn } from "@/lib/utils";

const COLORS = ['#005f40', '#00a86b', '#4ade80', '#86efac', '#bbf7d0'];

// Month data mapping
const monthsData = {
  "july": julyAnalyticsData,
  "august": augustAnalyticsData
};

const availableMonths = [
  { value: "july", label: "July 2025", status: "complete" },
  { value: "august", label: "August 2025", status: "in_progress" }
];

// Enhanced metric card with responsive design
function MetricCard({ 
  label, 
  value, 
  trend, 
  icon: Icon,
  description,
  className 
}: { 
  label: string; 
  value: string | number; 
  trend?: string;
  icon?: React.ElementType;
  description?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-white rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1 hidden lg:block">{description}</p>
          )}
          {trend && (
            <p className="text-xs sm:text-sm text-blue-600 mt-1 flex items-center">
              {trend.includes('down') ? (
                <TrendingDown className="w-3 h-3 mr-0.5 text-red-600" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              )}
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced password dialog
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
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Analytics Dashboard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 text-base"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-12 text-base">
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
  
	  // Get current month data
	  const data = monthsData[selectedMonth as keyof typeof monthsData];
	  const inProgressData =
	    "status" in data && data.status === "in_progress" ? data : null;
	  const isInProgress = inProgressData !== null;

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("analytics-auth", "true");
  };

  // Format acquisition data for charts (handle empty data for August)
  const acquisitionData = data.acquisition.firstTimeUsers && Object.keys(data.acquisition.firstTimeUsers).length > 0
    ? Object.entries(data.acquisition.firstTimeUsers).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        value: value,
        fullName: key
      }))
    : [];

  // Prepare radar chart data for behavior metrics (handle in-progress data)
	  const behaviorRadarData = isInProgress ? [] : [
	    { metric: 'Session Duration', value: parseInt(data.behavior.metrics.avgSessionDuration) * 20 },
	    { metric: 'Pages/Session', value: data.behavior.metrics.pagesPerSession * 25 },
	    { metric: 'Engagement', value: 100 - data.behavior.metrics.bounceRate },
	    { metric: 'Scroll Depth', value: data.behavior.metrics.avgScrollDepth },
	    { metric: 'Mobile Usage', value: data.executive.mobileShare }
	  ];

  // Navigation sections with icons
  const sections = [
    { value: "overview", label: "Overview", icon: BarChart3, color: "text-blue-600" },
    { value: "acquisition", label: "Acquisition", icon: Users, color: "text-blue-600" },
    { value: "behavior", label: "Behavior", icon: Activity, color: "text-purple-600" },
    { value: "search", label: "Search", icon: Search, color: "text-orange-600" },
    { value: "reputation", label: "Reputation", icon: Star, color: "text-blue-500" },
    { value: "highlights", label: "Highlights", icon: Award, color: "text-pink-600" },
    { value: "targets", label: "Targets", icon: Target, color: "text-indigo-600" }
  ];

  if (!isAuthenticated) {
    return (
      <>
        <MetaTags 
          title="Analytics Dashboard - Access Restricted"
          description="Secure analytics dashboard for practice performance metrics"
        />
        <PasswordDialog 
          open={showPasswordDialog} 
          onOpenChange={setShowPasswordDialog}
          onAuthenticate={handleAuthenticate}
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Access Restricted</CardTitle>
              <CardDescription className="text-sm">Please authenticate to view the analytics dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPasswordDialog(true)}
                className="w-full h-12 text-base"
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
        title="Analytics Dashboard | July 2025 Performance"
        description="Comprehensive analytics dashboard showing marketing performance and practice metrics"
        robots="noindex, nofollow, noarchive"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className={cn(
          "hidden lg:block w-64 bg-white border-r border-gray-200 fixed h-full z-40",
          "transform transition-transform duration-300"
        )}>
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">Performance Dashboard</p>
            </div>

            {/* Desktop Month Selector */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">SELECT MONTH</label>
              <div className="space-y-1">
                {availableMonths.map((month) => (
                  <button
                    key={month.value}
                    onClick={() => setSelectedMonth(month.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm",
                      selectedMonth === month.value
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <span>{month.label}</span>
                    {month.status === "in_progress" && (
                      <Badge variant={selectedMonth === month.value ? "secondary" : "outline"} className="text-xs">
                        Live
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              {data.period?.lastUpdated && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                  <Clock className="w-3 h-3" />
                  {data.period.lastUpdated}
                </div>
              )}
            </div>

            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.value}
                  onClick={() => setSelectedSection(section.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "hover:bg-gray-100 group",
                    selectedSection === section.value 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : ''
                  )}
                >
                  <section.icon className={cn(
                    "w-5 h-5",
                    selectedSection === section.value ? "text-white" : section.color
                  )} />
                  <span className="font-medium text-sm">{section.label}</span>
                  {selectedSection === section.value && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>

            {/* Quick Stats Summary */}
            {!isInProgress && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-600 mb-3">QUICK STATS</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">New Users</span>
                    <span className="font-bold">{typeof data.executive.newUsers === 'number' ? data.executive.newUsers.toLocaleString() : data.executive.newUsers}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Bounce Rate</span>
                    <span className="font-bold">{typeof data.executive.bounceRate === 'number' ? `${data.executive.bounceRate}%` : data.executive.bounceRate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Mobile Share</span>
                    <span className="font-bold">{typeof data.executive.mobileShare === 'number' ? `${data.executive.mobileShare}%` : data.executive.mobileShare}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile/Tablet Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                <p className="text-xs text-gray-600">Performance Dashboard</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Month Selector */}
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{month.label}</span>
                        {month.status === "in_progress" && (
                          <Badge variant="outline" className="ml-2 text-xs">Live</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <ScrollArea className="w-full">
            <div className="flex gap-2 px-4 pb-3">
              {sections.map((section) => (
                <Button
                  key={section.value}
                  variant={selectedSection === section.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(section.value)}
                  className="flex items-center gap-1 text-xs whitespace-nowrap"
                >
                  <section.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{section.label}</span>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
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
                    <h2 className="text-xl font-bold">Navigation</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
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
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                          selectedSection === section.value 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-100'
                        )}
                      >
                        <section.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{section.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 pt-24 lg:pt-0">
	          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
	            {/* Coming Soon State for August */}
	            {inProgressData && (
	              <motion.div
	                initial={{ opacity: 0, y: 20 }}
	                animate={{ opacity: 1, y: 0 }}
	                className="mb-6"
	              >
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-blue-600" />
	                      </div>
	                      <div className="flex-1">
	                        <h3 className="text-lg font-semibold mb-2">August Data Collection in Progress</h3>
	                        <p className="text-sm text-gray-700 mb-4">{inProgressData.message}</p>
	                        
	                        {/* Early Indicators */}
	                        {inProgressData.preview?.earlyIndicators && (
	                          <div className="mb-4">
	                            <h4 className="text-sm font-semibold mb-2">Early Indicators:</h4>
	                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
	                              {inProgressData.preview.earlyIndicators.map((indicator, index) => (
	                                <div key={index} className="flex items-start gap-2">
	                                  <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
	                                  <span className="text-xs text-gray-600">{indicator}</span>
	                                </div>
	                              ))}
	                            </div>
	                          </div>
	                        )}

	                        {/* Coming Soon Features */}
	                        {inProgressData.comingSoon?.features && (
	                          <div>
	                            <h4 className="text-sm font-semibold mb-2">Coming Soon:</h4>
	                            <div className="space-y-2">
	                              {inProgressData.comingSoon.features.map((feature, index) => (
	                                <div key={index} className="bg-white/50 rounded-lg p-3">
	                                  <div className="flex items-center justify-between mb-1">
	                                    <span className="text-sm font-medium">{feature.title}</span>
	                                    <Badge variant="outline" className="text-xs">{feature.expectedDate}</Badge>
	                                  </div>
	                                  <p className="text-xs text-gray-600">{feature.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {/* Overview Section */}
            {selectedSection === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Page Header - Desktop only */}
                <div className="hidden lg:block">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Executive Dashboard</h2>
                  <p className="text-gray-600">{data.executive.summary}</p>
                </div>

	                {/* Key Metrics Grid */}
	                {!isInProgress ? (
	                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
	                    <MetricCard 
	                      label="New Users" 
	                      value={data.executive.newUsers.toLocaleString()}
                      trend="+12% from June"
                      icon={Users}
                      description="First-time visitors"
                    />
                    <MetricCard 
                      label="Returning" 
                      value={data.executive.returningUsers}
                      icon={Users}
                      description="Repeat visitors"
                    />
                    <MetricCard 
                      label="Mobile Share" 
                      value={`${data.executive.mobileShare}%`}
                      icon={Smartphone}
                      description="Mobile traffic"
                    />
                    <MetricCard 
                      label="Avg Session" 
                      value={data.executive.avgSessionDuration}
                      icon={Clock}
                      description="Time on site"
                    />
                    <MetricCard 
                      label="Pages/Session" 
                      value={data.executive.pagesPerSession}
                      icon={FileText}
                      description="Page views"
                    />
                    <MetricCard 
                      label="Bounce Rate" 
                      value={`${data.executive.bounceRate}%`}
                      trend="down 3%"
                      icon={Activity}
                      description="Single page exits"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                    <MetricCard 
                      label="New Users" 
                      value={data.executive.newUsers}
                      icon={Users}
                      description="Being tracked"
                    />
                    <MetricCard 
                      label="Returning" 
                      value={data.executive.returningUsers}
                      icon={Users}
                      description="Measuring..."
                    />
                    <MetricCard 
                      label="Mobile Share" 
                      value={data.executive.mobileShare}
                      icon={Smartphone}
                      description="Analyzing..."
                    />
                    <MetricCard 
                      label="Avg Session" 
                      value={data.executive.avgSessionDuration}
                      icon={Clock}
                      description="Recording..."
                    />
                    <MetricCard 
                      label="Pages/Session" 
                      value={data.executive.pagesPerSession}
                      icon={FileText}
                      description="Processing..."
                    />
                    <MetricCard 
                      label="Bounce Rate" 
                      value={data.executive.bounceRate}
                      icon={Activity}
                      description="Monitoring..."
                    />
                  </div>
                )}

                {/* Charts Row - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {/* Traffic Sources */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-base lg:text-lg">Traffic Sources</CardTitle>
                      <CardDescription className="text-xs lg:text-sm">Where visitors come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 sm:h-56 lg:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={acquisitionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {acquisitionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {acquisitionData.slice(0, 4).map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sessions Trend */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-base lg:text-lg">Sessions Trend</CardTitle>
                      <CardDescription className="text-xs lg:text-sm">Daily visitor activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 sm:h-56 lg:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.acquisition.sessionsBySource}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="sessions" 
                              stroke="#005f40" 
                              fill="#005f40" 
                              fillOpacity={0.1} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Behavior Radar - Desktop only */}
                  <Card className="hidden xl:block">
                    <CardHeader>
                      <CardTitle className="text-base lg:text-lg">Engagement Metrics</CardTitle>
                      <CardDescription className="text-xs lg:text-sm">Multi-dimensional analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={behaviorRadarData}>
                            <PolarGrid stroke="#e0e0e0" />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Radar 
                              dataKey="value" 
                              stroke="#005f40" 
                              fill="#005f40" 
                              fillOpacity={0.3} 
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Tables - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base lg:text-lg">Top Pages</CardTitle>
                      <CardDescription className="text-xs lg:text-sm">Most visited content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.behavior.topPages.map((page, index) => (
                          <div key={page.page} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                {index + 1}
                              </Badge>
                              <span className="text-sm font-medium">{page.page}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2 hidden sm:block">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${(page.sessions / 287) * 100}%` }}
                                />
                              </div>
                              <Badge variant="secondary" className="text-xs">{page.sessions}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base lg:text-lg">Top Cities</CardTitle>
                      <CardDescription className="text-xs lg:text-sm">Geographic distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {data.acquisition.topCities.map((city, index) => (
                          <Badge 
                            key={city} 
                            variant={index < 3 ? "default" : "secondary"}
                            className="py-2 px-3 justify-center"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {city}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Acquisition Section */}
            {selectedSection === "acquisition" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">User Acquisition</h2>
                  <p className="text-sm lg:text-base text-gray-600">Understanding how new users discover your practice</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Main Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>First-Time Users by Channel</CardTitle>
                      <CardDescription>Distribution across acquisition sources</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 sm:h-80 lg:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.acquisition.sessionsBySource}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="sessions" fill="#005f40" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Side Stats */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Channel Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {acquisitionData.map((channel, index) => (
                            <div key={channel.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{channel.name}</span>
                                <span className="text-gray-600">{channel.value}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${channel.value}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                            <p className="text-xs text-gray-600">Direct traffic leads at 36.8%, indicating strong brand recognition</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                            <p className="text-xs text-gray-600">Organic search at 24.7% shows good SEO performance</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                            <p className="text-xs text-gray-600">Social media at 17.8% has growth potential</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Behavior Section */}
            {selectedSection === "behavior" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">User Behavior Analysis</h2>
                  <p className="text-sm lg:text-base text-gray-600">{data.behavior.insight}</p>
                </div>

                {/* Metrics Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <MetricCard 
                    label="Avg Session Duration" 
                    value={data.behavior.metrics.avgSessionDuration}
                    icon={Clock}
                    trend="+8% from June"
                  />
                  <MetricCard 
                    label="Pages per Session" 
                    value={data.behavior.metrics.pagesPerSession}
                    icon={FileText}
                  />
                  <MetricCard 
                    label="Bounce Rate" 
                    value={`${data.behavior.metrics.bounceRate}%`}
                    icon={Activity}
                    trend="down 5%"
                  />
                  <MetricCard 
                    label="Scroll Depth" 
                    value={`${data.behavior.metrics.avgScrollDepth}%`}
                    icon={Eye}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Page Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Performance</CardTitle>
                      <CardDescription>Sessions and engagement by page</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.behavior.topPages.map((page) => (
                          <div key={page.page} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{page.page}</p>
                              <p className="text-xs text-gray-500">Landing page</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{page.sessions}</p>
                              <p className="text-xs text-gray-500">sessions</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Click Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Click Elements</CardTitle>
                      <CardDescription>Most interacted elements on site</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.behavior.topClicks.map((click, index) => (
                          <div key={click.element} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                                index === 0 ? "bg-blue-700" : index === 1 ? "bg-blue-500" : "bg-gray-600"
                              )}>
                                {index + 1}
                              </div>
                              <span className="font-medium text-sm">{click.element}</span>
                            </div>
                            <Badge variant="secondary">{click.clicks} clicks</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Friction Analysis */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      Friction Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-800">{data.behavior.friction.note}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Search Section */}
            {selectedSection === "search" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Search Performance</h2>
                  <p className="text-sm lg:text-base text-gray-600">{data.searchVisibility.insight}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Landing Pages */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Landing Pages</CardTitle>
                      <CardDescription>Pages with highest search impressions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.searchVisibility.landingPagesByImpressions.map((page, index) => (
                          <div key={page.page} className="flex items-center justify-between p-3 border-l-4 border-primary hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <p className="font-mono text-xs text-gray-600">{page.page}</p>
                              <p className="text-sm font-medium mt-1">Page {index + 1}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{page.impressions.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">impressions</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search Queries */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Search Queries</CardTitle>
                      <CardDescription>Keywords driving traffic</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.searchVisibility.queriesByClicks.map((query) => (
                          <div key={query.query} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{query.query}</span>
                              <Badge>{query.clicks} clicks</Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(query.clicks / 42) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Conversion Tracking */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      Conversion Tracking Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-gray-600 mb-1">Qualified Leads</p>
                        <p className="text-2xl font-bold">{data.conversions.qualifiedLeads}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-gray-600 mb-1">Converted</p>
                        <p className="text-2xl font-bold">{data.conversions.convertedLeads}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
                        <p className="text-2xl font-bold">0%</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <Badge variant="destructive">{data.conversions.status}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{data.conversions.message}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Reputation Section */}
            {selectedSection === "reputation" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Online Reputation</h2>
                  <p className="text-sm lg:text-base text-gray-600">Building trust through patient reviews and social proof</p>
                </div>

                {/* Review Stats */}
	                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
	                  <Card>
	                    <CardContent className="pt-6">
	                      <div className="text-center">
	                        <p className="text-sm text-gray-600 mb-2">July Reviews</p>
	                        <p className="text-4xl font-bold mb-3">{julyAnalyticsData.reputation.july.newReviewsCount}</p>
	                        <div className="flex justify-center gap-2">
	                          <Badge variant="outline">Google: {julyAnalyticsData.reputation.july.platformBreakdown.google}</Badge>
	                          <Badge variant="outline">Yelp: {julyAnalyticsData.reputation.july.platformBreakdown.yelp}</Badge>
	                        </div>
	                      </div>
	                    </CardContent>
	                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Average Rating</p>
	                        <div className="flex justify-center items-center gap-1 mb-2">
	                          {[...Array(5)].map((_, i) => (
	                            <Star key={i} className="w-6 h-6 fill-blue-500 text-blue-500" />
	                          ))}
	                        </div>
	                        <p className="text-2xl font-bold">{julyAnalyticsData.reputation.july.avgRatingNew.toFixed(1)}</p>
	                      </div>
	                    </CardContent>
	                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
	                      <div className="text-center">
	                        <p className="text-sm text-gray-600 mb-2">August Preview</p>
	                        <p className="text-4xl font-bold mb-3">{julyAnalyticsData.reputation.previewAug.newReviewsCount}</p>
	                        <p className="text-xs text-gray-500">Already incoming</p>
	                      </div>
	                    </CardContent>
	                  </Card>
	                </div>

	                {/* Recent Reviews Grid */}
	                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
	                  {julyAnalyticsData.reputation.july.topQuotes.map((quote, index) => (
	                    <Card key={index} className="hover:shadow-lg transition-shadow">
	                      <CardContent className="pt-6">
	                        <div className="flex items-start gap-3">
	                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
	                            <Star className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm italic text-gray-700 mb-3">"{quote.excerpt}"</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{quote.source} • {quote.date}</Badge>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-blue-500 text-blue-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Common Review Themes</CardTitle>
                    <CardDescription>What patients appreciate most</CardDescription>
                  </CardHeader>
	                  <CardContent>
	                    <div className="flex flex-wrap gap-2">
	                      {julyAnalyticsData.reputation.july.themes.map((theme) => (
	                        <Badge key={theme} variant="secondary" className="py-2 px-4">
	                          {theme}
	                        </Badge>
	                      ))}
	                    </div>
                  </CardContent>
                </Card>

                {/* Insight */}
	                <Card className="bg-blue-50 border-blue-200">
	                  <CardContent className="pt-6">
	                    <p className="text-sm text-blue-800 flex items-start">
	                      <TrendingUp className="w-5 h-5 mr-2 flex-shrink-0" />
	                      {julyAnalyticsData.reputation.insight}
	                    </p>
	                  </CardContent>
	                </Card>
	              </motion.div>
	            )}

            {/* Highlights Section */}
            {selectedSection === "highlights" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">July Achievements</h2>
                  <p className="text-sm lg:text-base text-gray-600">Proof of work and value delivered this month</p>
                </div>

	                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
	                  {julyAnalyticsData.highlights.map((highlight, index) => (
	                    <motion.div
	                      key={index}
	                      initial={{ opacity: 0, x: -20 }}
	                      animate={{ opacity: 1, x: 0 }}
	                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Award className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{highlight.title}</h4>
                                <Badge 
                                  variant={highlight.status === 'complete' ? "default" : "secondary"}
                                  className="mt-1"
                                >
                                  {highlight.status === 'complete' ? 'Complete' : 'In Progress'}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{highlight.date}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{highlight.impact}</p>
                          
                          <div className="space-y-2">
                            {highlight.evidence.map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-gray-500">{item}</span>
                              </div>
                            ))}
                          </div>
                          
                          {highlight.statusNote && (
                            <p className="text-xs text-orange-600 mt-3 p-2 bg-orange-50 rounded">{highlight.statusNote}</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Tech Stack */}
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Technology Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
	                      <div>
	                        <h4 className="text-sm font-semibold mb-3">Analytics Tools</h4>
	                        <div className="flex flex-wrap gap-2">
	                          {julyAnalyticsData.stack.analytics.map((tool) => (
	                            <Badge key={tool} variant="outline">
	                              {tool}
	                            </Badge>
	                          ))}
	                        </div>
	                      </div>
	                      <div>
	                        <h4 className="text-sm font-semibold mb-3">AI Models</h4>
	                        <div className="flex flex-wrap gap-2">
	                          {julyAnalyticsData.stack.aiModels.map((model) => (
	                            <Badge key={model} variant="outline">
	                              {model}
	                            </Badge>
	                          ))}
	                        </div>
	                      </div>
	                    </div>
	                    <p className="text-xs text-gray-500 mt-4">{julyAnalyticsData.stack.notes}</p>
	                  </CardContent>
	                </Card>
	              </motion.div>
	            )}

            {/* Targets Section */}
            {selectedSection === "targets" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">August Targets</h2>
                  <p className="text-sm lg:text-base text-gray-600">Priority actions to maintain growth momentum</p>
                </div>

	                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
	                  {julyAnalyticsData.targetsNextMonth.map((target) => (
	                    <motion.div
	                      key={target.priority}
	                      initial={{ opacity: 0, x: -20 }}
	                      animate={{ opacity: 1, x: 0 }}
	                      transition={{ delay: (target.priority - 1) * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02]">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
                              {target.priority}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold mb-2">{target.title}</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{target.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Call to Action */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Ready to implement these targets?</h3>
                        <p className="text-sm text-gray-600">Schedule a strategy session to discuss the August action plan</p>
                      </div>
                      <Button size="lg" className="hidden sm:block">
                        Schedule Meeting
                      </Button>
                    </div>
                    <Button className="w-full mt-4 sm:hidden">
                      Schedule Meeting
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
