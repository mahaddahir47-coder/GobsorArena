import { Venue } from '../types';

export const initialVenues: Venue[] = [
  {
    id: 1,
    name: 'Jazeera Turf Arena',
    price: 25,
    size: '7-aside',
    location: 'Wadajir, Mogadishu',
    nextSlot: 'Mon, 15 Jun at 6:00 AM',
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
    rating: 4.8,
    reviewsCount: 128,
    amenities: ['Floodlights', 'Changing Rooms', 'Showers', 'Free Parking', 'Water Station', 'WiFi'],
    contactPhone: '+252 61 555 1111',
    description: 'Mogadishu\'s premium seven-aside professional turf located near Jazeera. Featuring FIFA-grade artificial grass, state-of-the-art floodlight illumination for evening fixtures, high-security parking, and fully equipped separate lockers for teams.',
    reviewsList: [
      { id: 'r1', userName: 'Abdi N.', rating: 5, comment: 'Excellent pitch condition! Perfect for night matches under the lights. The turf feels premium and is non-slippery.', date: '3 days ago' },
      { id: 'r2', userName: 'Fahma H.', rating: 4, comment: 'Great atmosphere and convenient location. Highly recommended but make sure to book early.', date: '1 week ago' },
    ]
  },
  {
    id: 2,
    name: 'Lido Beach Football Zone',
    price: 30,
    size: '5-aside',
    location: 'Abdiaziz, Mogadishu',
    nextSlot: 'Mon, 15 Jun at 2:00 PM',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    rating: 4.9,
    reviewsCount: 212,
    amenities: ['Ocean View', 'Floodlights', 'Free Parking', 'Water Station', 'Fenced Fringes'],
    contactPhone: '+252 61 555 2222',
    description: 'An outstanding hub designed for fast-paced 5-aside action right next to the sea breeze of Lido Beach. The fence boards allow continuous fluid play, while adjacent spectators get an unmatched view.',
    reviewsList: [
      { id: 'r3', userName: 'Farhan Mohamud', rating: 5, comment: 'Best 5-aside rebound boards with a nice ocean breeze. Very fast gameplay!', date: '2 days ago' }
    ]
  },
  {
    id: 3,
    name: 'Hodan Sports Arena',
    price: 20,
    size: '7-aside',
    location: 'Hodan, Mogadishu',
    nextSlot: 'Tue, 16 Jun at 10:00 AM',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    rating: 4.7,
    reviewsCount: 95,
    amenities: ['Floodlights', 'Changing Rooms', 'Cafeteria', 'Showers', 'Fenced Fringes'],
    contactPhone: '+252 61 555 3333',
    description: 'Our premier central sports hub in Hodan district boasts parallel high-quality grounds and a fully-stocked sports cafe serving fresh juices and Somali tea after your matches.',
    reviewsList: [
      { id: 'r4', userName: 'Yasin J.', rating: 5, comment: 'Top-tier turf and a great cafeteria next door to grab a fresh camel-milk tea after the match.', date: '4 days ago' }
    ]
  },
  {
    id: 4,
    name: 'Waberi Sports Center',
    price: 18,
    size: '5-aside',
    location: 'Waberi, Mogadishu',
    nextSlot: 'Mon, 15 Jun at 4:00 PM',
    image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80',
    rating: 4.5,
    reviewsCount: 78,
    amenities: ['Free Parking', 'Water Station', 'Locker Rooms'],
    contactPhone: '+252 61 555 4444',
    description: 'A breezy and standard turf right in the heart of Waberi. This affordable pitch offers premium high-impact shock pad layers to minimize leg fatigue.',
    reviewsList: []
  },
  {
    id: 5,
    name: 'Shibis Youth Turf',
    price: 15,
    size: '5-aside',
    location: 'Shibis, Mogadishu',
    nextSlot: 'Wed, 17 Jun at 8:00 AM',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80',
    rating: 4.6,
    reviewsCount: 64,
    amenities: ['Floodlights', 'Water Station', 'Community Lounge'],
    contactPhone: '+252 61 555 5555',
    description: 'Exclusivity meets local community spirit. Very popular evening playground in Shibis featuring advanced heat-reduction turf fibers that make daytime play comfortable.',
    reviewsList: [
      { id: 'r5', userName: 'Khadar A.', rating: 5, comment: 'Very friendly community and cheapest rates for an evening 5v5 setup.', date: 'A week ago' }
    ]
  },
  {
    id: 6,
    name: 'Hamar Weyne Elite Pitch',
    price: 22,
    size: '7-aside',
    location: 'Hamar Weyne, Mogadishu',
    nextSlot: 'Mon, 15 Jun at 5:00 PM',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80',
    rating: 4.7,
    reviewsCount: 110,
    amenities: ['Fenced Fringes', 'Floodlights', 'Showers', 'Player Lounge'],
    contactPhone: '+252 61 555 6666',
    description: 'Located in the historic Hamar Weyne area. Features rapid cage setups for fast-paced 7-aside matches, great light towers, and a comfortable team viewing deck.',
    reviewsList: []
  }
];

export const locations = [
  { value: '', label: 'All Locations' },
  { value: 'wadajir', label: 'Wadajir, Mogadishu' },
  { value: 'abdiaziz', label: 'Abdiaziz, Mogadishu' },
  { value: 'hodan', label: 'Hodan, Mogadishu' },
  { value: 'waberi', label: 'Waberi, Mogadishu' },
  { value: 'shibis', label: 'Shibis, Mogadishu' },
  { value: 'hamar_weyne', label: 'Hamar Weyne, Mogadishu' }
];

export const mockMatchesList = [
  {
    id: 'm1',
    title: 'Casual 7v7 - Need 2 Defenders!',
    venueName: 'Jazeera Turf Arena',
    venueLocation: 'Wadajir, Mogadishu',
    date: '2026-06-15',
    timeSlot: '06:00 PM - 07:00 PM',
    creatorName: 'Mohamed Ali',
    creatorPhone: '+252 61 500 1234',
    spotsNeeded: 14,
    spotsFilled: 12,
    playersList: ['Mohamed A.', 'Abdi F.', 'Farhan Y.', 'Yasin M.', 'Omar D.', 'Mustafa A.', 'Zakaria H.', 'Hamza G.', 'Anas B.', 'Khashar S.', 'Dawood T.', 'Khadar O.']
  },
  {
    id: 'm2',
    title: 'Lido Beach Derbies (5-aside)',
    venueName: 'Lido Beach Football Zone',
    venueLocation: 'Abdiaziz, Mogadishu',
    date: '2026-06-16',
    timeSlot: '02:00 PM - 03:00 PM',
    creatorName: 'Amina Yusuf',
    creatorPhone: '+252 61 511 4455',
    spotsNeeded: 10,
    spotsFilled: 7,
    playersList: ['Amina Y.', 'Faduma M.', 'Asma H.', 'Hassan G.', 'Abdirahman O.', 'Bashir J.', 'Khalid O.']
  }
];
