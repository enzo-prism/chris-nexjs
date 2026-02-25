"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Calendar, Users, TrendingUp, Eye, Target, Globe, Clock, Star, 
  CheckCircle2, AlertCircle, MapPin, Zap, ChevronRight, Menu,
  BarChart3, Search, Award, MessageSquare, Smartphone
} from "lucide-react";
import MetaTags from "@/components/common/MetaTags";
import { julyAnalyticsData } from "@/data/analytics-july-2025";

const COLORS = ['#005f40', '#00a86b', '#4ade80', '#86efac', '#bbf7d0'];
const data = julyAnalyticsData;

// Mobile-optimized metric card
function MetricCard({ label, value, trend, icon: Icon }: { 
  label: string; 
  value: string | number; 
  trend?: string;
  icon?: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Mobile-optimized password dialog
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for existing session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("analytics-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      setShowPasswordDialog(true);
    }
  }, []);

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("analytics-auth", "true");
  };

  // Format acquisition data for pie chart
  const acquisitionData = Object.entries(data.acquisition.firstTimeUsers).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    value: value
  }));

  // Mobile navigation sections
  const sections = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "acquisition", label: "Acquisition", icon: Users },
    { value: "behavior", label: "Behavior", icon: Eye },
    { value: "search", label: "Search", icon: Search },
    { value: "reputation", label: "Reputation", icon: Star },
    { value: "highlights", label: "Highlights", icon: Award },
    { value: "targets", label: "Targets", icon: Target }
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              <p className="text-xs text-gray-600">July 2025</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.value}
                    onClick={() => {
                      setSelectedSection(section.value);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedSection === section.value 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation */}
        <div className="hidden md:block bg-white border-b border-gray-200">
          <ScrollArea className="w-full">
            <div className="flex gap-2 p-4">
              {sections.map((section) => (
                <Button
                  key={section.value}
                  variant={selectedSection === section.value ? "default" : "outline"}
                  onClick={() => setSelectedSection(section.value)}
                  className="flex items-center gap-2"
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Overview Section */}
          {selectedSection === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Executive Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Executive Summary</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {data.executive.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                    <MetricCard 
                      label="New Users" 
                      value={data.executive.newUsers.toLocaleString()}
                      icon={Users}
                    />
                    <MetricCard 
                      label="Returning" 
                      value={data.executive.returningUsers}
                      icon={Users}
                    />
                    <MetricCard 
                      label="Mobile Share" 
                      value={`${data.executive.mobileShare}%`}
                      icon={Smartphone}
                    />
                    <MetricCard 
                      label="Avg Session" 
                      value={data.executive.avgSessionDuration}
                      icon={Clock}
                    />
                    <MetricCard 
                      label="Pages/Session" 
                      value={data.executive.pagesPerSession}
                      icon={Eye}
                    />
                    <MetricCard 
                      label="Bounce Rate" 
                      value={`${data.executive.bounceRate}%`}
                      icon={Target}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Top Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.acquisition.sessionsBySource.slice(0, 4).map((source) => (
                        <div key={source.source} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{source.source}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(source.sessions / 402) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-10 text-right">{source.sessions}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Top Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.behavior.topPages.slice(0, 4).map((page) => (
                        <div key={page.page} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{page.page}</span>
                          <Badge variant="secondary" className="text-xs">{page.sessions}</Badge>
                        </div>
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
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Traffic Acquisition</CardTitle>
                  <CardDescription className="text-xs">How visitors find your practice</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Mobile-optimized chart */}
                  <div className="h-64 -mx-2">
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

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {acquisitionData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Top Cities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.acquisition.topCities.map((city, index) => (
                      <Badge 
                        key={city} 
                        variant={index < 3 ? "default" : "secondary"}
                        className="text-xs py-1"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {city}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Behavior Section */}
          {selectedSection === "behavior" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">User Behavior</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {data.behavior.insight}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="metrics" className="border rounded-lg px-3">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        Key Metrics
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-3 pb-3">
                          <MetricCard label="Avg Session" value={data.behavior.metrics.avgSessionDuration} />
                          <MetricCard label="Pages/Session" value={data.behavior.metrics.pagesPerSession} />
                          <MetricCard label="Bounce Rate" value={`${data.behavior.metrics.bounceRate}%`} />
                          <MetricCard label="Avg Scroll" value={`${data.behavior.metrics.avgScrollDepth}%`} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pages" className="border rounded-lg px-3">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        Top Pages
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pb-3">
                          {data.behavior.topPages.map((page) => (
                            <div key={page.page} className="flex justify-between items-center py-1">
                              <span className="text-sm">{page.page}</span>
                              <Badge variant="secondary" className="text-xs">{page.sessions}</Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="clicks" className="border rounded-lg px-3">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        Top Clicks
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pb-3">
                          {data.behavior.topClicks.map((click) => (
                            <div key={click.element} className="flex justify-between items-center py-1">
                              <span className="text-sm">{click.element}</span>
                              <Badge variant="secondary" className="text-xs">{click.clicks}</Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800 flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                      {data.behavior.friction.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Search Section */}
          {selectedSection === "search" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Search Visibility</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {data.searchVisibility.insight}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="pages" className="border rounded-lg px-3 mb-3">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        Landing Pages by Impressions
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pb-3">
                          {data.searchVisibility.landingPagesByImpressions.map((page) => (
                            <div key={page.page} className="flex justify-between items-center py-1">
                              <span className="text-xs font-mono text-gray-600 truncate flex-1 mr-2">
                                {page.page}
                              </span>
                              <Badge className="text-xs">{page.impressions.toLocaleString()}</Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="queries" className="border rounded-lg px-3">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        Search Queries
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pb-3">
                          {data.searchVisibility.queriesByClicks.map((query) => (
                            <div key={query.query} className="flex justify-between items-center py-1">
                              <span className="text-sm">{query.query}</span>
                              <Badge variant="secondary" className="text-xs">{query.clicks}</Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Conversion Tracking Alert */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    Conversion Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="text-xs text-gray-600">Qualified Leads</p>
                      <p className="text-xl font-bold">{data.conversions.qualifiedLeads}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="text-xs text-gray-600">Converted</p>
                      <p className="text-xl font-bold">{data.conversions.convertedLeads}</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs mb-2">{data.conversions.status}</Badge>
                  <p className="text-xs text-gray-700 leading-relaxed">{data.conversions.message}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reputation Section */}
          {selectedSection === "reputation" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Reputation & Reviews</CardTitle>
                  <CardDescription className="text-xs">Building trust through social proof</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Review Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">July Reviews</p>
                      <p className="text-2xl font-bold">{data.reputation.july.newReviewsCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Rating</p>
                      <div className="flex justify-center items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-blue-500 text-blue-500" />
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Aug Preview</p>
                      <p className="text-2xl font-bold">{data.reputation.previewAug.newReviewsCount}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Recent Reviews */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Recent Highlights</h4>
                    {data.reputation.july.topQuotes.map((quote, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs italic mb-2">"{quote.excerpt}"</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {quote.source} • {quote.date}
                          </Badge>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-blue-500 text-blue-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Themes */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Common Themes</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {data.reputation.july.themes.map((theme) => (
                        <Badge key={theme} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Highlights Section */}
          {selectedSection === "highlights" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">July Highlights</CardTitle>
                  <CardDescription className="text-xs">What we shipped this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-4 border-primary pl-3 py-2"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold flex-1">{highlight.title}</h4>
                          <Badge 
                            variant={highlight.status === 'complete' ? "default" : "secondary"}
                            className="text-xs ml-2"
                          >
                            {highlight.status === 'complete' ? 'Done' : 'In Progress'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">{highlight.impact}</p>
                        <div className="space-y-1">
                          {highlight.evidence.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-500">{item}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{highlight.date}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Targets Section */}
          {selectedSection === "targets" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">August Targets</CardTitle>
                  <CardDescription className="text-xs">Priority actions for next month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.targetsNextMonth.map((target) => (
                      <motion.div
                        key={target.priority}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (target.priority - 1) * 0.1 }}
                        className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {target.priority}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold mb-1">{target.title}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">{target.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
