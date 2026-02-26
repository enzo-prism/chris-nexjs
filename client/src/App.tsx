import * as React from "react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "@/lib/helmet";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import HotjarTracking from "@/components/common/HotjarTracking";
import SitemapLink from "@/components/common/SitemapLink";
import Favicons from "@/components/common/Favicons";
import SupplementalContent from "@/components/common/SupplementalContent";
import PreloadResources from "@/components/seo/PreloadResources";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildOrganizationSchema,
  buildPersonSchema,
  buildWebSiteSchema,
} from "@/lib/structuredData";
import PracticeAssistant from "@/components/chat/PracticeAssistant";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import PatientResources from "@/pages/PatientResources";
import Testimonials from "@/pages/Testimonials";
import Contact from "@/pages/Contact";
import Schedule from "@/pages/Schedule";
import ThankYou from "@/pages/ThankYou";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import HipaaNotice from "@/pages/HipaaNotice";
import Accessibility from "@/pages/Accessibility";
import DentalVeneers from "@/pages/DentalVeneers";
import DentalImplants from "@/pages/DentalImplants";
import Invisalign from "@/pages/Invisalign";
import InvisalignResources from "@/pages/InvisalignResources";
import EmergencyDental from "@/pages/EmergencyDental";
import ZoomWhitening from "@/pages/ZoomWhitening";
import ZoomWhiteningSchedule from "@/pages/ZoomWhiteningSchedule";
import PreventiveDentistry from "@/pages/PreventiveDentistry";
import RestorativeDentistry from "@/pages/RestorativeDentistry";
import PediatricDentistry from "@/pages/PediatricDentistry";
import TeethWhiteningPaloAlto from "@/pages/TeethWhiteningPaloAlto";
import DentalCleaningPaloAlto from "@/pages/DentalCleaningPaloAlto";
import CavityFillingsPaloAlto from "@/pages/CavityFillingsPaloAlto";
import CrownsPaloAlto from "@/pages/CrownsPaloAlto";
import PediatricDentistPaloAlto from "@/pages/PediatricDentistPaloAlto";
import DentistMenloPark from "@/pages/DentistMenloPark";
import DentistStanford from "@/pages/DentistStanford";
import DentistMountainView from "@/pages/DentistMountainView";
import DentistLosAltos from "@/pages/DentistLosAltos";
import DentistLosAltosHills from "@/pages/DentistLosAltosHills";
import DentistSunnyvale from "@/pages/DentistSunnyvale";
import DentistCupertino from "@/pages/DentistCupertino";
import DentistRedwoodCity from "@/pages/DentistRedwoodCity";
import DentistAtherton from "@/pages/DentistAtherton";
import DentistRedwoodShores from "@/pages/DentistRedwoodShores";
import Locations from "@/pages/Locations";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import PatientStories from "@/pages/PatientStories";
import Changelog from "@/pages/Changelog";
import Gallery from "@/pages/Gallery";

const AnalyticsMinimal = React.lazy(() => import("@/pages/AnalyticsMinimal"));
const GATestPage = React.lazy(() => import("@/pages/GATestPage"));

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main style={{ paddingTop: "var(--header-height, 110px)" }}>
        <React.Suspense fallback={<div className="min-h-[40vh]" />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/services" component={Services} />
            <Route path="/patient-resources" component={PatientResources} />
            <Route path="/testimonials" component={Testimonials} />
            <Route path="/patient-stories" component={PatientStories} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/contact" component={Contact} />
            <Route path="/schedule" component={Schedule} />
            <Route path="/blog" component={Blog} />
            <Route path="/changelog" component={Changelog} />
            <Route path="/thank-you" component={ThankYou} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/hipaa" component={HipaaNotice} />
            <Route path="/accessibility" component={Accessibility} />
            <Route path="/dental-veneers" component={DentalVeneers} />
            <Route path="/dental-implants" component={DentalImplants} />
            <Route path="/zoom-whitening" component={ZoomWhitening} />
            <Route path="/preventive-dentistry" component={PreventiveDentistry} />
            <Route path="/restorative-dentistry" component={RestorativeDentistry} />
            <Route path="/pediatric-dentistry" component={PediatricDentistry} />
            <Route path="/teeth-whitening-palo-alto" component={TeethWhiteningPaloAlto} />
            <Route path="/dental-cleaning-palo-alto" component={DentalCleaningPaloAlto} />
            <Route path="/cavity-fillings-palo-alto" component={CavityFillingsPaloAlto} />
            <Route path="/crowns-palo-alto" component={CrownsPaloAlto} />
            <Route path="/pediatric-dentist-palo-alto" component={PediatricDentistPaloAlto} />
            <Route path="/dentist-menlo-park" component={DentistMenloPark} />
            <Route path="/dentist-stanford" component={DentistStanford} />
            <Route path="/dentist-mountain-view" component={DentistMountainView} />
            <Route path="/dentist-los-altos" component={DentistLosAltos} />
            <Route path="/dentist-los-altos-hills" component={DentistLosAltosHills} />
            <Route path="/dentist-sunnyvale" component={DentistSunnyvale} />
            <Route path="/dentist-cupertino" component={DentistCupertino} />
            <Route path="/dentist-redwood-city" component={DentistRedwoodCity} />
            <Route path="/dentist-atherton" component={DentistAtherton} />
            <Route path="/dentist-redwood-shores" component={DentistRedwoodShores} />
            <Route path="/locations" component={Locations} />
            <Route path="/invisalign" component={Invisalign} />
            <Route path="/invisalign/resources" component={InvisalignResources} />
            <Route path="/emergency-dental" component={EmergencyDental} />
            <Route path="/zoom-whitening/schedule" component={ZoomWhiteningSchedule} />
            <Route path="/analytics" component={AnalyticsMinimal} />
            <Route path="/ga-test" component={GATestPage} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route component={NotFound} />
          </Switch>
        </React.Suspense>
        <SupplementalContent />
      </main>
      <PracticeAssistant />
      <Footer />
    </>
  );
}

type AppShellProps = {
  readonly ssrPath?: string;
  readonly queryClientOverride?: QueryClient;
  readonly helmetContext?: unknown;
};

function WouterPathSync() {
  const pathname = usePathname() || "/";
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (pathname !== location) {
      navigate(pathname, { replace: true });
    }
  }, [pathname, location, navigate]);

  return null;
}

export function AppShell({
  ssrPath,
  queryClientOverride,
  helmetContext,
}: AppShellProps) {
  const client = queryClientOverride ?? queryClient;
  return (
    <QueryClientProvider client={client}>
      <HelmetProvider context={helmetContext}>
        <WouterRouter ssrPath={ssrPath}>
          <GoogleAnalytics />
          <HotjarTracking />
          <SitemapLink />
          <Favicons />
          <PreloadResources />
          <WouterPathSync />
          <StructuredData
            data={[
              buildOrganizationSchema(),
              buildPersonSchema(),
              buildWebSiteSchema(),
            ]}
            id="global-organization-schema"
          />
          <Router />
          <Toaster />
        </WouterRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

function App() {
  return <AppShell />;
}

export default App;
