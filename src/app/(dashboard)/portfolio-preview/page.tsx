'use client';

import { Portfolio } from '@/components/athlete/Portfolio';

const sampleAthlete = {
  id: 'preview-autumn-strode',
  firstName: 'Autumn',
  lastName: 'Strode',
  classYear: 2026,
  state: 'Illinois',
  school: 'Normal Community High School',
  gender: 'Female',
  profilePhotoUrl: null,
  bio: "Three-time Junior Gold qualifier and 2025 Illinois State Champion. I've been bowling competitively since age 8 and I'm looking for a D1 program where I can compete at the highest level while pursuing a degree in Sports Management. My game has improved significantly this season thanks to my coach and the EYT tournament circuit.",
  dominantHand: 'RIGHT',
  style: 'ONE_HANDED',
  seasonAverage: 218,
  highGame: 278,
  highSeries: 724,
  revRate: 310,
  ballSpeed: 16.5,
  spareConversion: 82,
  gpa: 3.8,
  act: 28,
  sat: 1320,
  ncaaStatus: 'Eligible',
  intendedMajor: 'Sports Management',
  usbcVerified: true,
  isActivelyRecruiting: true,
  coachName: 'Mike Thompson',
  coachContact: 'mike.t@normalcommunity.edu',
  proShop: 'Strike Zone Pro Shop',
  bowlingCenter: 'Parkside Lanes',
  usbcClub: 'Wednesday Night Mixed',
  tournaments: [
    { id: 't1', name: 'Holiday Classic', place: 1, average: 224, date: 'Dec 2025' },
    { id: 't2', name: 'EYT Arlington', place: 2, average: 218, date: 'Nov 2025' },
    { id: 't3', name: 'Midwest Challenge', place: 3, average: 215, date: 'Oct 2025' },
    { id: 't4', name: 'Illinois State Championship', place: 1, average: 232, date: 'Sep 2025' },
    { id: 't5', name: 'Junior Gold Qualifier', place: 5, average: 210, date: 'Aug 2025' },
  ],
  arsenal: [
    {
      id: 'b1',
      name: 'Hyper Cell Fused',
      brand: 'Storm',
      weight: 15,
      coverstock: 'Solid',
      pinToPap: '4"',
      valAngle: '45\u00B0',
      drillingAngle: '60\u00B0',
      isPrimary: true,
    },
    {
      id: 'b2',
      name: 'IQ Tour',
      brand: 'Storm',
      weight: 15,
      coverstock: 'Pearl',
      pinToPap: '3.5"',
      valAngle: '50\u00B0',
      drillingAngle: '40\u00B0',
      isPrimary: false,
    },
    {
      id: 'b3',
      name: 'Tropical Surge',
      brand: 'Storm',
      weight: 15,
      coverstock: 'Pearl',
      pinToPap: null,
      valAngle: null,
      drillingAngle: null,
      isPrimary: false,
    },
  ],
  media: [
    { id: 'm1', type: 'video', url: '#', title: 'Holiday Classic Finals' },
    { id: 'm2', type: 'video', url: '#', title: 'Practice Session - Dec 2025' },
    { id: 'm3', type: 'video', url: '#', title: 'Illinois State Championship' },
  ],
};

export default function PortfolioPreviewPage() {
  return (
    <div className="py-8 px-4">
      <Portfolio athlete={sampleAthlete} />
    </div>
  );
}
