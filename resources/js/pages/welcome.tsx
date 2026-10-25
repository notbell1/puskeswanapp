import React, { useState, useEffect, useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import { ToastProvider, useToast } from "@/components/ui";
import {
    Navbar,
    HeroSection,
    AboutSection,
    MedicalRecordSection,
    NewsSection,
    NewsDetailModal,
    StaffSection,
    ContactSection,
    Footer,
    LandingPreloader,
    NAV_ITEMS,
    NewsItem,
    MedicalRecord,
    ContactFormData,
} from "@/components/landing";

interface WelcomeProps {
    staffMembers?: any[];
    articles?: any[];
    initialCaptcha?: string;
}

function LandingPageContent({
    staffMembers,
    articles,
    initialCaptcha,
}: WelcomeProps) {
    const { success, error, info } = useToast();
    const page = usePage();
    const user = (page?.props as any)?.auth?.user;

    const [activeSection, setActiveSection] = useState<string>("/");
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const isProgrammaticScrollRef = useRef<boolean>(false);
    const scrollLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    const [contactForm, setContactForm] = useState<ContactFormData>({
        name: "",
        phone: "",
        petType: "Kucing",
        message: "",
    });
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

    const navigateToSection = (
        path: string,
        sectionId: string,
        event?: React.MouseEvent,
    ) => {
        if (event) event.preventDefault();

        setActiveSection(path);
        setMobileMenuOpen(false);

        const matchingItem = NAV_ITEMS.find((item) => item.path === path);
        if (matchingItem) {
            document.title =
                matchingItem.path === "/"
                    ? "Beranda - Puskeswan"
                    : `${matchingItem.label} - Puskeswan`;
        }

        window.history.pushState(null, "", path);

        const element = document.getElementById(sectionId);
        if (element) {
            isProgrammaticScrollRef.current = true;
            if (scrollLockTimeoutRef.current) {
                clearTimeout(scrollLockTimeoutRef.current);
            }
            scrollLockTimeoutRef.current = setTimeout(() => {
                isProgrammaticScrollRef.current = false;
            }, 800);

            const navbarOffset = 76;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - navbarOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        const currentPath = window.location.pathname;
        const matchingItem = NAV_ITEMS.find((item) => item.path === currentPath);

        if (matchingItem && matchingItem.id !== "hero") {
            setActiveSection(matchingItem.path);
            document.title = `${matchingItem.label} - Puskeswan`;
            isProgrammaticScrollRef.current = true;

            setTimeout(() => {
                const element = document.getElementById(matchingItem.id);
                if (element) {
                    const navbarOffset = 76;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition =
                        elementPosition + window.pageYOffset - navbarOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
                setTimeout(() => {
                    isProgrammaticScrollRef.current = false;
                }, 700);
            }, 150);
        } else {
            setActiveSection("/");
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            if (isProgrammaticScrollRef.current) {
                return;
            }

            const scrollPosition = window.scrollY + 140;

            for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
                const item = NAV_ITEMS[i];
                const section = document.getElementById(item.id);
                if (section) {
                    const top = section.offsetTop;
                    if (scrollPosition >= top) {
                        if (activeSection !== item.path) {
                            setActiveSection(item.path);
                            document.title =
                                item.path === "/"
                                    ? "Beranda - Puskeswan"
                                    : `${item.label} - Puskeswan`;
                            window.history.replaceState(null, "", item.path);
                        }
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [activeSection]);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactForm.name || !contactForm.phone || !contactForm.message) {
            error("Mohon lengkapi seluruh formulir konsultasi!");
            return;
        }

        setIsSendingMessage(true);
        setTimeout(() => {
            setIsSendingMessage(false);
            success(
                "Pesan konsultasi Anda berhasil dikirim ke tim dokter Puskeswan!",
            );
            setContactForm({
                name: "",
                phone: "",
                petType: "Kucing",
                message: "",
            });
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-purple-100 selection:text-purple-900">
            <LandingPreloader />

            <Navbar
                activeSection={activeSection}
                onNavigate={navigateToSection}
                user={user}
                isScrolled={isScrolled}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <HeroSection onNavigate={navigateToSection} />

            <AboutSection />

            <MedicalRecordSection initialCaptcha={initialCaptcha} />

            <NewsSection
                articles={articles}
                onSelectNews={(item) => setSelectedNews(item)}
            />

            <StaffSection staffMembers={staffMembers} />

            <ContactSection
                contactForm={contactForm}
                setContactForm={setContactForm}
                isSending={isSendingMessage}
                onSubmit={handleContactSubmit}
            />

            <Footer onNavigate={navigateToSection} user={user} />

            <NewsDetailModal
                news={selectedNews}
                onClose={() => setSelectedNews(null)}
            />
        </div>
    );
}

export default function Welcome(props: WelcomeProps) {
    return (
        <ToastProvider>
            <Head title="Beranda" />
            <LandingPageContent {...props} />
        </ToastProvider>
    );
}
