import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { EnrollModal } from '../components/EnrollModal';
import { StarSeam, CinemaBand } from '../components/v2/fx';
import { LangHero, LangCourses, MockTests, SundayEvents, LangClosing } from '../components/v2/pages/languages/Sections';
import '../components/v2/v2.css';

export default function Languages() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');

    const handleEnroll = (courseName: string) => {
        setSelectedCourse(courseName);
        setModalOpen(true);
    };

    return (
        <div className="v2">
            <SEO title="Til Kurslari" description="DATA Ta'lim Stansiyasida Ingliz, Rus, Koreys va Nemis tillari. IELTS, TOPIK va CEFR ga tayyorgarlik." />

            <LangHero onEnroll={() => handleEnroll('Til kurslari')} />
            <LangCourses onEnroll={handleEnroll} />
            <CinemaBand src="/images/v2/languages.webp" className="py-[6vh]" />
            <MockTests />
            <StarSeam />
            <SundayEvents />
            <LangClosing onEnroll={() => handleEnroll('Til kurslari')} />

            <EnrollModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                courseName={selectedCourse}
                type="enroll"
            />
        </div>
    );
}
