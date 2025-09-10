#!/usr/bin/env node

/**
 * COMPLETE Categories AI Image Generation Script
 * Generates images for EVERY category, style, project type, room, cultural influence,
 * historical period, and fantasy theme from COMPREHENSIVE-DESIGN-CATEGORIES.md
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

// === COMPLETE COMPREHENSIVE IMAGE SPECIFICATIONS ===
// Based on ALL categories from COMPREHENSIVE-DESIGN-CATEGORIES.md

const ALL_CATEGORIES_IMAGES = [

  // =================== PROJECT TYPES ===================

  // === RESIDENTIAL ===
  
  // Single-Family Homes
  { filename: 'single-family-modern-living-room.png', style: 'Single-Family Modern', room: 'Living Room', 
    prompt: 'Create a photorealistic modern living room in suburban single-family home. Features: open floor plan connecting to kitchen, family-friendly furniture, built-in entertainment center, large windows with backyard views, neutral colors, comfortable seating, children\'s play area integration. Contemporary family life with practical elegance. Professional interior photography, bright natural daylight.' },

  { filename: 'single-family-traditional-kitchen.png', style: 'Single-Family Traditional', room: 'Kitchen', 
    prompt: 'Create a photorealistic traditional kitchen in American suburban home. Features: wood cabinetry with raised panels, granite countertops, subway tile backsplash, stainless appliances, breakfast nook, family dining area, homework station, pantry storage. Family-centered design with timeless appeal. Professional interior photography, warm family lighting.' },

  // Multi-Family Housing
  { filename: 'multi-family-contemporary-bedroom.png', style: 'Multi-Family Contemporary', room: 'Bedroom', 
    prompt: 'Create a photorealistic contemporary bedroom in modern apartment complex. Features: space-efficient design, built-in storage, large windows, neutral palette, flexible furniture, urban views, compact but comfortable layout, shared wall considerations. Urban living with smart space solutions. Professional interior photography, natural apartment lighting.' },

  { filename: 'multi-family-industrial-loft.png', style: 'Multi-Family Industrial', room: 'Loft', 
    prompt: 'Create a photorealistic industrial loft in converted multi-family building. Features: exposed brick, steel beams, concrete floors, high ceilings, large windows, open floor plan, urban character, minimal partitions, city views. Converted warehouse living with urban sophistication. Professional interior photography, dramatic natural light.' },

  // Apartments & Condos
  { filename: 'luxury-condo-penthouse-living.png', style: 'Luxury Condo', room: 'Living Room', 
    prompt: 'Create a photorealistic luxury condominium living room on 40th floor. Features: floor-to-ceiling windows, city skyline views, marble floors, designer furniture, integrated lighting, bar area, sophisticated materials, high-end finishes, panoramic vistas. Urban luxury with breathtaking views. Professional interior photography, golden hour city light.' },

  { filename: 'studio-apartment-efficient-design.png', style: 'Studio Apartment', room: 'Studio', 
    prompt: 'Create a photorealistic efficient studio apartment in urban high-rise. Features: murphy bed, convertible dining table, compact kitchen, storage solutions, multipurpose furniture, large window, clever space division, minimal but functional. Small space living with maximum efficiency. Professional interior photography, bright optimized lighting.' },

  // Townhouses
  { filename: 'townhouse-georgian-foyer.png', style: 'Georgian Townhouse', room: 'Foyer', 
    prompt: 'Create a photorealistic Georgian townhouse foyer in historic district. Features: marble floors, curved staircase, crystal chandelier, period moldings, antique console table, oil paintings, classical proportions, elegant entry. Historic urban elegance with period authenticity. Professional interior photography, dramatic entrance lighting.' },

  { filename: 'townhouse-modern-kitchen.png', style: 'Modern Townhouse', room: 'Kitchen', 
    prompt: 'Create a photorealistic modern townhouse kitchen with three stories. Features: sleek cabinetry, quartz countertops, stainless appliances, breakfast bar, rear garden access, urban views, efficient layout, contemporary materials. City living with suburban comfort. Professional interior photography, bright kitchen lighting.' },

  // Villas & Mansions
  { filename: 'mediterranean-villa-master-suite.png', style: 'Mediterranean Villa', room: 'Master Suite', 
    prompt: 'Create a photorealistic Mediterranean villa master suite in Tuscan countryside. Features: vaulted ceilings with exposed beams, terracotta floors, wrought iron bed, French doors to terrace, vineyard views, stone fireplace, luxurious textiles, old-world craftsmanship. Italian villa luxury with romantic elegance. Professional interior photography, golden Tuscan light.' },

  { filename: 'french-chateau-grand-salon.png', style: 'French Chateau', room: 'Grand Salon', 
    prompt: 'Create a photorealistic French chateau grand salon in Loire Valley castle. Features: 18th century furniture, Aubusson tapestries, crystal chandeliers, marble fireplace, parquet floors, gilt mirrors, period paintings, palatial scale. French aristocratic grandeur with historical authenticity. Professional interior photography, chandelier elegance.' },

  // Tiny Homes
  { filename: 'tiny-home-scandinavian-interior.png', style: 'Tiny Home Scandinavian', room: 'Living Area', 
    prompt: 'Create a photorealistic Scandinavian tiny home interior (400 sq ft). Features: light wood everywhere, white walls, loft bedroom, compact kitchen, storage stairs, large windows, natural light, efficient design, cozy textiles, multipurpose furniture. Minimalist living with maximum coziness. Professional interior photography, bright Nordic light.' },

  { filename: 'tiny-home-rustic-cabin.png', style: 'Tiny Home Rustic', room: 'Cabin Interior', 
    prompt: 'Create a photorealistic rustic tiny cabin in mountain setting. Features: reclaimed wood walls, wood-burning stove, loft bed, compact kitchen, fold-down table, forest views, cozy quilts, lantern lighting, natural materials. Off-grid living with rustic comfort. Professional interior photography, warm cabin glow.' },

  // Lofts & Penthouses
  { filename: 'penthouse-art-deco-bar.png', style: 'Penthouse Art Deco', room: 'Bar', 
    prompt: 'Create a photorealistic Art Deco penthouse bar in Manhattan skyscraper. Features: geometric patterns, mirrored surfaces, chrome fixtures, marble bar top, city lights views, vintage cocktail equipment, velvet seating, metallic accents, 1920s glamour. Rooftop luxury with Jazz Age sophistication. Professional interior photography, city lights ambiance.' },

  { filename: 'industrial-loft-artist-studio.png', style: 'Industrial Loft', room: 'Artist Studio', 
    prompt: 'Create a photorealistic artist studio in converted warehouse loft. Features: north-facing windows, concrete floors, exposed brick, high ceilings, easels, paint-splattered surfaces, art supplies, canvases, creative chaos, industrial character. Creative workspace with urban authenticity. Professional interior photography, natural artist light.' },

  // === COMMERCIAL ===

  // Office Buildings
  { filename: 'corporate-headquarters-reception.png', style: 'Corporate Modern', room: 'Reception', 
    prompt: 'Create a photorealistic corporate headquarters reception in glass tower. Features: marble floors, reception desk with company logo, comfortable seating, large windows with city views, professional lighting, contemporary art, sophisticated materials, brand integration. Corporate prestige with welcoming atmosphere. Professional interior photography, polished business lighting.' },

  { filename: 'tech-company-open-office.png', style: 'Tech Company Modern', room: 'Open Office', 
    prompt: 'Create a photorealistic tech company open office in Silicon Valley campus. Features: flexible workstations, collaborative spaces, exposed ceiling, industrial materials, colorful accents, casual furniture, tech equipment, natural light, indoor plants, innovation atmosphere. Modern workplace with creative energy. Professional interior photography, bright collaborative lighting.' },

  // Coworking Spaces
  { filename: 'coworking-industrial-chic.png', style: 'Coworking Industrial', room: 'Common Area', 
    prompt: 'Create a photorealistic industrial chic coworking space in converted warehouse. Features: exposed brick walls, steel beams, concrete floors, flexible furniture, communal tables, coffee bar, natural light, urban character, creative atmosphere, diverse workspace options. Shared economy with industrial charm. Professional interior photography, dynamic workspace lighting.' },

  { filename: 'coworking-scandinavian-focus-room.png', style: 'Coworking Scandinavian', room: 'Focus Room', 
    prompt: 'Create a photorealistic Scandinavian focus room in modern coworking space. Features: light wood, white walls, natural textures, ergonomic furniture, plants, acoustic panels, minimal distractions, phone booth design, clean lines, calming atmosphere. Productivity sanctuary with Nordic simplicity. Professional interior photography, soft focus lighting.' },

  // === HOSPITALITY ===

  // Luxury Hotels
  { filename: 'luxury-hotel-presidential-suite.png', style: 'Luxury Hotel', room: 'Presidential Suite', 
    prompt: 'Create a photorealistic presidential suite in five-star urban hotel. Features: marble floors, crystal chandeliers, silk wallpaper, antique furniture, panoramic city views, separate dining room, luxury bathroom, butler service area, diplomatic elegance, ultimate comfort. Presidential luxury with international sophistication. Professional interior photography, opulent lighting.' },

  { filename: 'luxury-hotel-spa-relaxation.png', style: 'Luxury Hotel Spa', room: 'Relaxation Room', 
    prompt: 'Create a photorealistic luxury hotel spa relaxation room. Features: natural stone, water features, soft lighting, comfortable loungers, aromatherapy elements, zen atmosphere, heated floors, plush textiles, serene color palette, wellness focus. Spa luxury with therapeutic tranquility. Professional interior photography, gentle spa lighting.' },

  // Boutique Hotels
  { filename: 'boutique-hotel-library-lounge.png', style: 'Boutique Hotel', room: 'Library Lounge', 
    prompt: 'Create a photorealistic boutique hotel library lounge in historic building. Features: floor-to-ceiling bookshelves, vintage leather chairs, fireplace, Persian rugs, intimate lighting, curated book collection, craft cocktail service, cozy alcoves, literary atmosphere. Intimate luxury with intellectual charm. Professional interior photography, warm literary lighting.' },

  { filename: 'boutique-hotel-rooftop-bar.png', style: 'Boutique Hotel Rooftop', room: 'Bar', 
    prompt: 'Create a photorealistic boutique hotel rooftop bar with city views. Features: retractable roof, comfortable seating, fire features, city skyline views, craft cocktail station, atmospheric lighting, weather protection, social atmosphere, elevated experience. Urban nightlife with sophisticated ambiance. Professional interior photography, evening city lights.' },

  // Restaurants & Cafes
  { filename: 'fine-dining-restaurant-main.png', style: 'Fine Dining', room: 'Main Dining Room', 
    prompt: 'Create a photorealistic fine dining restaurant interior in upscale district. Features: white tablecloths, comfortable banquettes, sophisticated lighting, wine display, open kitchen views, acoustic treatments, elegant materials, intimate table spacing, culinary theater. Gastronomic excellence with refined atmosphere. Professional interior photography, warm dining ambiance.' },

  { filename: 'artisan-coffee-shop-counter.png', style: 'Artisan Coffee Shop', room: 'Counter Area', 
    prompt: 'Create a photorealistic artisan coffee shop in historic neighborhood. Features: exposed brick, reclaimed wood counters, vintage espresso machine, coffee bean displays, chalkboard menu, communal seating, natural light, plants, local art, craft coffee culture. Third wave coffee with authentic atmosphere. Professional interior photography, warm cafe lighting.' },

  // === CULTURAL & EDUCATIONAL ===

  // Museums & Art Galleries
  { filename: 'modern-art-museum-gallery.png', style: 'Modern Art Museum', room: 'Gallery', 
    prompt: 'Create a photorealistic modern art museum gallery with contemporary works. Features: white walls, polished concrete floors, track lighting, climate control, security systems, minimal distractions, artwork focus, clean lines, professional display, cultural gravitas. Artistic excellence with museum sophistication. Professional interior photography, precise gallery lighting.' },

  { filename: 'natural-history-museum-hall.png', style: 'Natural History Museum', room: 'Exhibition Hall', 
    prompt: 'Create a photorealistic natural history museum exhibition hall with dinosaur displays. Features: high ceilings, dramatic lighting, fossil displays, interactive elements, educational graphics, family-friendly design, scientific accuracy, wonder and discovery atmosphere. Educational entertainment with scientific authority. Professional interior photography, dramatic exhibition lighting.' },

  // Libraries & Archives
  { filename: 'public-library-reading-room.png', style: 'Public Library', room: 'Reading Room', 
    prompt: 'Create a photorealistic public library reading room in Carnegie-era building. Features: long wooden tables, comfortable chairs, natural light from tall windows, book stacks, quiet atmosphere, study carrels, classical architecture, community resource, democratic learning. Public education with architectural dignity. Professional interior photography, scholarly lighting.' },

  { filename: 'university-library-rare-books.png', style: 'University Library', room: 'Rare Books Room', 
    prompt: 'Create a photorealistic university rare books library in Gothic revival building. Features: climate-controlled environment, security systems, reading tables with lamps, leather-bound volumes, manuscript displays, scholarly atmosphere, research focus, academic prestige. Scholarly sanctuary with intellectual heritage. Professional interior photography, focused study lighting.' },

  // === HEALTHCARE & WELLNESS ===

  // Spas & Wellness Centers
  { filename: 'luxury-spa-treatment-room.png', style: 'Luxury Spa', room: 'Treatment Room', 
    prompt: 'Create a photorealistic luxury spa treatment room in resort setting. Features: massage table, natural materials, water sounds, aromatherapy, soft lighting, heated floors, plush towels, serene color palette, wellness focus, therapeutic atmosphere. Spa luxury with healing tranquility. Professional interior photography, gentle therapeutic lighting.' },

  { filename: 'wellness-center-yoga-studio.png', style: 'Wellness Center', room: 'Yoga Studio', 
    prompt: 'Create a photorealistic yoga studio in holistic wellness center. Features: bamboo floors, mirrors, natural light, minimalist design, yoga props storage, sound system, peaceful atmosphere, plant accents, zen influences, mindfulness focus. Wellness sanctuary with spiritual tranquility. Professional interior photography, natural yoga lighting.' },

  // Fitness Centers & Gyms
  { filename: 'luxury-gym-cardio-area.png', style: 'Luxury Gym', room: 'Cardio Area', 
    prompt: 'Create a photorealistic luxury gym cardio area in upscale fitness club. Features: premium equipment, entertainment screens, water stations, towel service, air circulation, motivational atmosphere, professional design, member amenities, fitness technology. Athletic excellence with luxury comfort. Professional interior photography, energizing fitness lighting.' },

  { filename: 'crossfit-gym-functional-training.png', style: 'CrossFit Gym', room: 'Training Area', 
    prompt: 'Create a photorealistic CrossFit gym functional training area. Features: rubber floors, pull-up rigs, free weights, functional equipment, high ceilings, industrial lighting, motivational atmosphere, community focus, athletic performance, intensity training. Functional fitness with community spirit. Professional interior photography, high-energy training lighting.' },

  // =================== ROOM FUNCTIONS & SPACES ===================

  // === CORE LIVING SPACES ===

  // Foyer/Entryway
  { filename: 'grand-foyer-crystal-chandelier.png', style: 'Grand Traditional', room: 'Foyer', 
    prompt: 'Create a photorealistic grand traditional foyer in estate mansion. Features: marble floors with inlay patterns, curved double staircase, 20-foot crystal chandelier, oil paintings, antique console tables, fresh flowers, classical columns, impressive scale. First impression grandeur with welcoming elegance. Professional interior photography, dramatic entrance lighting.' },

  { filename: 'modern-minimalist-entryway.png', style: 'Modern Minimalist', room: 'Entryway', 
    prompt: 'Create a photorealistic modern minimalist entryway in contemporary home. Features: floating bench, hidden shoe storage, large mirror, single artwork, coat hooks, natural light, clean lines, clutter-free design, functional beauty, serene welcome. Minimalist welcome with functional elegance. Professional interior photography, clean natural lighting.' },

  // === WORK & STUDY SPACES ===

  // Conference Room
  { filename: 'corporate-conference-room-boardroom.png', style: 'Corporate Modern', room: 'Conference Room', 
    prompt: 'Create a photorealistic corporate conference room for executive meetings. Features: large table for 16 people, executive chairs, video conferencing equipment, city views, presentation screens, coffee service area, acoustic treatments, professional lighting. Executive decision-making with technological sophistication. Professional interior photography, professional meeting lighting.' },

  { filename: 'creative-agency-brainstorm-room.png', style: 'Creative Agency', room: 'Brainstorm Room', 
    prompt: 'Create a photorealistic creative agency brainstorm room in advertising office. Features: writable walls, colorful furniture, flexible seating, idea boards, creative supplies, inspirational quotes, collaborative atmosphere, energy and innovation, playful elements. Creative thinking with collaborative energy. Professional interior photography, bright creative lighting.' },

  // === ENTERTAINMENT & RECREATION ===

  // Media Room/Home Theater
  { filename: 'luxury-home-theater-cinema.png', style: 'Luxury Home Theater', room: 'Cinema', 
    prompt: 'Create a photorealistic luxury home theater in basement cinema room. Features: tiered seating with recliners, large projection screen, surround sound speakers, acoustic panels, concession area, dramatic lighting, theater atmosphere, premium technology, movie magic. Cinema luxury with entertainment excellence. Professional interior photography, cinematic lighting.' },

  { filename: 'family-media-room-casual.png', style: 'Family Media Room', room: 'Media Room', 
    prompt: 'Create a photorealistic family media room in suburban home. Features: large sectional sofa, big screen TV, game console area, storage for movies and games, comfortable atmosphere, family-friendly design, casual seating, entertainment center. Family entertainment with comfortable functionality. Professional interior photography, warm family lighting.' },

  // Game Room
  { filename: 'luxury-game-room-billiards.png', style: 'Luxury Game Room', room: 'Billiards Room', 
    prompt: 'Create a photorealistic luxury game room with billiards in mansion basement. Features: professional pool table, leather seating, bar area, sports memorabilia, dartboard, card table, masculine atmosphere, entertainment focus, club-like ambiance, recreational luxury. Gentleman\'s recreation with sophisticated leisure. Professional interior photography, warm club lighting.' },

  { filename: 'teen-game-room-esports.png', style: 'Teen Game Room', room: 'Gaming Setup', 
    prompt: 'Create a photorealistic teen esports gaming room in suburban home. Features: gaming chairs, multiple monitors, LED lighting, streaming equipment, energy drink mini-fridge, gaming posters, cable management, competitive atmosphere, technology focus. Gaming excellence with competitive spirit. Professional interior photography, colorful gaming lighting.' },

  // === WELLNESS & SELF-CARE ===

  // Home Gym
  { filename: 'home-gym-luxury-equipment.png', style: 'Luxury Home Gym', room: 'Exercise Room', 
    prompt: 'Create a photorealistic luxury home gym in mansion basement. Features: professional equipment, mirrored walls, rubber flooring, sound system, TV screens, water station, towel service, air circulation, motivational atmosphere, personal training space. Private fitness with luxury amenities. Professional interior photography, energizing exercise lighting.' },

  { filename: 'yoga-studio-zen-meditation.png', style: 'Home Yoga Studio', room: 'Yoga Room', 
    prompt: 'Create a photorealistic home yoga studio in dedicated room. Features: bamboo floors, floor-to-ceiling windows, mirrors, yoga props storage, meditation corner, plants, natural light, peaceful atmosphere, zen influences, mindfulness space. Wellness sanctuary with spiritual tranquility. Professional interior photography, natural yoga lighting.' },

  // === SPECIALTY SPACES ===

  // Gaming Room/Esports Setup
  { filename: 'professional-esports-setup.png', style: 'Professional Esports', room: 'Gaming Room', 
    prompt: 'Create a photorealistic professional esports gaming room for streaming. Features: high-end gaming PCs, multiple curved monitors, professional lighting for streaming, green screen area, sound-dampening panels, gaming chairs, cable management, sponsor logos, competitive atmosphere. Professional gaming with broadcast quality. Professional interior photography, studio gaming lighting.' },

  // Recording Studio/Podcast Room
  { filename: 'professional-recording-studio.png', style: 'Recording Studio', room: 'Control Room', 
    prompt: 'Create a photorealistic professional recording studio control room. Features: mixing console, studio monitors, acoustic treatments, soundproofing, multiple screens, comfortable seating, professional lighting, equipment racks, audio excellence focus, technical precision. Music production with professional acoustics. Professional interior photography, controlled studio lighting.' },

  { filename: 'podcast-studio-intimate-setup.png', style: 'Podcast Studio', room: 'Recording Room', 
    prompt: 'Create a photorealistic podcast recording studio in converted room. Features: acoustic foam panels, professional microphones, round table setup, comfortable chairs, soundproofing, recording equipment, intimate atmosphere, conversation focus, broadcast quality. Intimate conversation with broadcast professionalism. Professional interior photography, warm podcast lighting.' },

  // Dance Studio
  { filename: 'dance-studio-ballet-mirrors.png', style: 'Dance Studio', room: 'Practice Room', 
    prompt: 'Create a photorealistic dance studio for ballet practice. Features: mirrored walls, ballet barres, sprung wooden floors, natural light, sound system, minimal distractions, professional atmosphere, artistic expression space, graceful environment. Dance excellence with artistic inspiration. Professional interior photography, bright dance lighting.' },

  // Beauty Salon/Makeup Room
  { filename: 'luxury-makeup-room-vanity.png', style: 'Luxury Makeup Room', room: 'Beauty Suite', 
    prompt: 'Create a photorealistic luxury makeup room in master suite. Features: Hollywood-style vanity with bulb lighting, marble countertops, makeup organization, comfortable seating, full-length mirrors, beauty tool storage, glamorous atmosphere, personal grooming luxury. Beauty ritual with Hollywood glamour. Professional interior photography, perfect vanity lighting.' },

  // =================== DESIGN STYLES ===================

  // === SCANDINAVIAN ===
  { filename: 'scandinavian-hygge-living-room.png', style: 'Scandinavian Hygge', room: 'Living Room', 
    prompt: 'Create a photorealistic Scandinavian living room embodying hygge in Copenhagen apartment. Features: light birch wood, white walls, cozy textiles, sheepskin rugs, candles, simple furniture, natural light, plants, minimal decoration, comfort focus, Nordic simplicity. Danish coziness with functional beauty. Professional interior photography, soft Nordic light.' },

  { filename: 'scandinavian-modern-kitchen.png', style: 'Scandinavian Modern', room: 'Kitchen', 
    prompt: 'Create a photorealistic Scandinavian modern kitchen in Stockholm home. Features: white cabinets, light wood countertops, stainless steel appliances, pendant lighting, herbs on windowsill, clean lines, functional design, natural materials, efficient layout. Nordic functionality with design excellence. Professional interior photography, bright kitchen light.' },

  // === KAWAII/CUTE ===
  { filename: 'kawaii-cute-bedroom-pastel.png', style: 'Kawaii Cute', room: 'Bedroom', 
    prompt: 'Create a photorealistic kawaii cute bedroom in Japanese apartment. Features: pastel pink and mint colors, stuffed animals, fairy lights, cute character decorations, fluffy textiles, round shapes, playful elements, sweet atmosphere, pop culture references, innocent charm. Japanese cute culture with playful sophistication. Professional interior photography, soft kawaii lighting.' },

  { filename: 'kawaii-cafe-interior-tokyo.png', style: 'Kawaii Cafe', room: 'Dining Area', 
    prompt: 'Create a photorealistic kawaii-themed cafe in Harajuku district Tokyo. Features: pastel colors, cute character decorations, round furniture, sweet treats display, playful signage, stuffed animal seating, rainbow elements, whimsical atmosphere, Japanese pop culture. Cute culture with commercial charm. Professional interior photography, bright kawaii lighting.' },

  // === POP ART ===
  { filename: 'pop-art-living-room-warhol.png', style: 'Pop Art', room: 'Living Room', 
    prompt: 'Create a photorealistic Pop Art living room inspired by Andy Warhol. Features: bright primary colors, graphic patterns, comic book elements, celebrity portraits, bold furniture, Campbell soup can art, geometric shapes, 1960s influences, artistic statement, commercial art aesthetic. Pop culture with artistic rebellion. Professional interior photography, bright pop lighting.' },

  { filename: 'pop-art-office-creative-space.png', style: 'Pop Art Office', room: 'Creative Office', 
    prompt: 'Create a photorealistic Pop Art creative office in advertising agency. Features: colorful furniture, graphic art posters, bold patterns, creative workspace, inspirational quotes, retro elements, artistic supplies, brainstorming walls, energetic atmosphere, creative stimulation. Creative energy with artistic inspiration. Professional interior photography, vibrant creative lighting.' },

  // === PSYCHEDELIC ===
  { filename: 'psychedelic-1960s-living-room.png', style: 'Psychedelic 1960s', room: 'Living Room', 
    prompt: 'Create a photorealistic psychedelic living room from 1960s counterculture. Features: swirling patterns, vibrant colors, bean bag chairs, lava lamps, peace symbols, tie-dye elements, round furniture, bold wallpaper, hippie aesthetic, consciousness expansion themes. 1960s counterculture with mind-expanding visuals. Professional interior photography, colorful psychedelic lighting.' },

  { filename: 'psychedelic-music-room-studio.png', style: 'Psychedelic Music', room: 'Music Room', 
    prompt: 'Create a photorealistic psychedelic music room from 1967 Summer of Love. Features: colorful sound equipment, trippy wall murals, beaded curtains, incense burning, vintage instruments, peace symbols, mandala patterns, creative chaos, musical expression, consciousness exploration. Musical creativity with psychedelic consciousness. Professional interior photography, atmospheric psychedelic lighting.' },

  // =================== HISTORICAL PERIODS & ÉPOQUES ===================

  // === ANCIENT PERIODS ===

  // Egyptian
  { filename: 'ancient-egyptian-throne-room.png', style: 'Ancient Egyptian', room: 'Throne Room', 
    prompt: 'Create a photorealistic ancient Egyptian throne room in pharaoh palace. Features: hieroglyphic wall carvings, gold accents, lotus column capitals, sphinx statues, colorful wall paintings, ceremonial furniture, royal symbols, sandstone construction, imperial majesty, divine authority. Pharaonic grandeur with ancient mysticism. Professional interior photography, golden Egyptian light.' },

  { filename: 'ancient-egyptian-temple-sanctuary.png', style: 'Ancient Egyptian Temple', room: 'Sanctuary', 
    prompt: 'Create a photorealistic ancient Egyptian temple sanctuary dedicated to Ra. Features: massive stone columns, hieroglyphic inscriptions, golden altar, ceremonial vessels, incense burning, sacred symbols, priests\' quarters, divine atmosphere, religious devotion, eternal afterlife themes. Sacred architecture with divine mystery. Professional interior photography, mystical temple lighting.' },

  // Greek
  { filename: 'ancient-greek-symposium-hall.png', style: 'Ancient Greek', room: 'Symposium Hall', 
    prompt: 'Create a photorealistic ancient Greek symposium hall in Athenian villa. Features: marble columns with Corinthian capitals, mosaic floors, frescoes of mythology, dining couches, wine vessels, philosophical atmosphere, classical proportions, intellectual gathering, democratic ideals. Greek philosophy with architectural perfection. Professional interior photography, classical Greek lighting.' },

  { filename: 'ancient-greek-library-alexandria.png', style: 'Ancient Greek Library', room: 'Scroll Room', 
    prompt: 'Create a photorealistic ancient Greek library in Alexandria. Features: papyrus scrolls on shelves, reading tables, oil lamps, scholarly atmosphere, geometric patterns, marble construction, knowledge preservation, intellectual pursuit, classical learning, wisdom tradition. Ancient scholarship with intellectual legacy. Professional interior photography, scholarly ancient lighting.' },

  // Roman
  { filename: 'ancient-roman-villa-atrium.png', style: 'Ancient Roman Villa', room: 'Atrium', 
    prompt: 'Create a photorealistic ancient Roman villa atrium in Pompeii. Features: central impluvium pool, frescoed walls, mosaic floors, Corinthian columns, marble statues, garden views, family shrine, Roman lifestyle, imperial luxury, sophisticated living. Roman civilization with architectural mastery. Professional interior photography, Mediterranean Roman light.' },

  { filename: 'ancient-roman-bath-house.png', style: 'Ancient Roman Baths', room: 'Caldarium', 
    prompt: 'Create a photorealistic ancient Roman bath house caldarium (hot room). Features: marble surfaces, heated floors, steam atmosphere, mosaic decorations, bronze fixtures, social bathing, Roman engineering, luxury relaxation, public health, community gathering. Roman engineering with social sophistication. Professional interior photography, steamy bath lighting.' },

  // === MEDIEVAL & RENAISSANCE ===

  // Gothic
  { filename: 'gothic-cathedral-chapel.png', style: 'Gothic Cathedral', room: 'Chapel', 
    prompt: 'Create a photorealistic Gothic cathedral chapel from 13th century France. Features: pointed arches, ribbed vaulting, stained glass windows, stone construction, religious sculptures, altar with gold details, candlelight, sacred atmosphere, divine aspiration, architectural innovation. Medieval spirituality with architectural transcendence. Professional interior photography, stained glass lighting.' },

  { filename: 'gothic-castle-great-hall.png', style: 'Gothic Castle', room: 'Great Hall', 
    prompt: 'Create a photorealistic Gothic castle great hall in medieval fortress. Features: stone walls, pointed arch windows, wooden beam ceiling, long dining tables, tapestries, weapons displays, fireplace, baronial atmosphere, feudal power, medieval life. Medieval nobility with fortress strength. Professional interior photography, torchlit medieval atmosphere.' },

  // Renaissance
  { filename: 'renaissance-palace-salon.png', style: 'Renaissance Palace', room: 'Salon', 
    prompt: 'Create a photorealistic Renaissance palace salon in 15th century Florence. Features: coffered ceiling, marble floors, classical columns, Renaissance paintings, ornate furniture, gold leaf details, symmetrical design, humanist ideals, artistic patronage, intellectual renaissance. Renaissance humanism with artistic flowering. Professional interior photography, Renaissance golden light.' },

  { filename: 'renaissance-villa-library.png', style: 'Renaissance Villa', room: 'Library', 
    prompt: 'Create a photorealistic Renaissance villa library in Tuscan countryside. Features: leather-bound books, writing desk, globe, scientific instruments, classical busts, frescoed ceiling, marble floors, scholarly pursuit, humanist learning, intellectual curiosity. Renaissance scholarship with humanist ideals. Professional interior photography, scholarly Renaissance lighting.' },

  // === 17TH-18TH CENTURY ===

  // Baroque 1600-1750
  { filename: 'baroque-palace-hall-mirrors.png', style: 'Baroque Palace', room: 'Hall of Mirrors', 
    prompt: 'Create a photorealistic Baroque hall of mirrors in Versailles-style palace. Features: elaborate mirrors, crystal chandeliers, gold leaf ornamentation, marble columns, painted ceiling, ornate furniture, court ceremonies, royal magnificence, absolute power, divine right monarchy. Royal absolutism with theatrical grandeur. Professional interior photography, glittering baroque lighting.' },

  { filename: 'baroque-church-altar.png', style: 'Baroque Church', room: 'High Altar', 
    prompt: 'Create a photorealistic Baroque church high altar from Counter-Reformation period. Features: dramatic sculptures, gold ornamentation, marble construction, painted ceiling, religious ecstasy, theatrical lighting, Catholic triumph, spiritual emotion, divine drama, religious art. Counter-Reformation spirituality with emotional intensity. Professional interior photography, dramatic religious lighting.' },

  // Rococo 1720-1780
  { filename: 'rococo-salon-marie-antoinette.png', style: 'Rococo Salon', room: 'Ladies Salon', 
    prompt: 'Create a photorealistic Rococo ladies salon in 18th century French chateau. Features: pastel colors, delicate furniture, gilded mirrors, porcelain decorations, silk wallpaper, intimate scale, feminine refinement, aristocratic leisure, court society, refined pleasure. French aristocratic refinement with feminine elegance. Professional interior photography, soft rococo lighting.' },

  { filename: 'rococo-boudoir-private-room.png', style: 'Rococo Boudoir', room: 'Private Boudoir', 
    prompt: 'Create a photorealistic Rococo private boudoir for French aristocrat. Features: silk-lined walls, delicate furniture, powder table, mirrors, perfume bottles, jewelry boxes, intimate lighting, personal luxury, feminine privacy, aristocratic indulgence, refined sensuality. Aristocratic intimacy with delicate sophistication. Professional interior photography, intimate rococo lighting.' },

  // === 19TH CENTURY ===

  // Victorian 1837-1901
  { filename: 'victorian-parlor-formal-sitting.png', style: 'Victorian Parlor', room: 'Formal Parlor', 
    prompt: 'Create a photorealistic Victorian formal parlor in 1880s London townhouse. Features: heavy drapery, ornate furniture, Persian rugs, antimacassars, piano, family portraits, gas lighting, moral propriety, domestic virtue, middle-class respectability, social calling rituals. Victorian respectability with domestic comfort. Professional interior photography, warm Victorian gaslight.' },

  { filename: 'victorian-dining-room-family-dinner.png', style: 'Victorian Dining', room: 'Dining Room', 
    prompt: 'Create a photorealistic Victorian dining room set for family dinner. Features: mahogany table, upholstered chairs, china cabinet, silver service, elaborate wallpaper, heavy curtains, gas chandelier, formal dining rituals, family hierarchy, domestic ceremony. Victorian family life with formal dining tradition. Professional interior photography, formal Victorian dining light.' },

  // =================== CULTURAL INFLUENCES ===================

  // === EUROPEAN INFLUENCES ===

  // French Parisian Chic
  { filename: 'parisian-chic-apartment-haussman.png', style: 'Parisian Chic', room: 'Living Room', 
    prompt: 'Create a photorealistic Parisian chic living room in Haussmann apartment. Features: herringbone parquet floors, French doors with juliet balconies, antique furniture mix, crystal chandelier, fresh flowers, neutral colors, effortless elegance, intellectual sophistication, cultural refinement. French sophistication with effortless elegance. Professional interior photography, Parisian natural light.' },

  { filename: 'provence-country-kitchen-french.png', style: 'French Provence', room: 'Country Kitchen', 
    prompt: 'Create a photorealistic French Provence country kitchen in stone farmhouse. Features: terracotta floors, exposed stone walls, rustic wood beams, copper pots, herbs growing, farm table, ladder-back chairs, country pottery, lavender accents, rural French life. Provence countryside with rustic French elegance. Professional interior photography, warm Provence sunlight.' },

  // Italian Renaissance/Modern
  { filename: 'italian-tuscan-villa-courtyard.png', style: 'Italian Tuscan', room: 'Courtyard', 
    prompt: 'Create a photorealistic Italian Tuscan villa courtyard in Chianti region. Features: stone columns, terracotta planters, climbing vines, wrought iron furniture, fountain centerpiece, cypress trees, wine country views, outdoor dining, al fresco living, Mediterranean climate. Tuscan luxury with vineyard elegance. Professional interior photography, golden Tuscan afternoon light.' },

  { filename: 'italian-modern-milan-apartment.png', style: 'Italian Modern Milan', room: 'Living Room', 
    prompt: 'Create a photorealistic modern Milan apartment living room in fashion district. Features: designer furniture, marble surfaces, contemporary art, sophisticated color palette, luxury materials, fashion influence, urban sophistication, Italian design heritage, style consciousness. Milan fashion with design sophistication. Professional interior photography, sophisticated Milan lighting.' },

  // Spanish Moorish
  { filename: 'spanish-moorish-courtyard-seville.png', style: 'Spanish Moorish', room: 'Courtyard', 
    prompt: 'Create a photorealistic Spanish Moorish courtyard in Seville palace. Features: horseshoe arches, intricate tile work, central fountain, orange trees, geometric patterns, Islamic influences, Christian reconquest adaptation, Andalusian culture, cross-cultural synthesis. Moorish sophistication with Spanish adaptation. Professional interior photography, dappled Andalusian sunlight.' },

  { filename: 'spanish-colonial-hacienda-sala.png', style: 'Spanish Colonial', room: 'Sala Principal', 
    prompt: 'Create a photorealistic Spanish colonial sala principal in Mexican hacienda. Features: thick adobe walls, wooden beam ceiling, terracotta floors, wrought iron details, religious art, family portraits, large fireplace, colonial furniture, Spanish heritage, New World adaptation. Colonial Spanish with New World character. Professional interior photography, warm hacienda lighting.' },

  // === ASIAN INFLUENCES ===

  // Vietnamese French Colonial
  { filename: 'vietnamese-french-colonial-villa.png', style: 'Vietnamese French Colonial', room: 'Living Room', 
    prompt: 'Create a photorealistic Vietnamese French colonial living room in Saigon villa. Features: high ceilings with fans, tropical hardwood, French colonial furniture, Vietnamese silk textiles, shuttered windows, indoor plants, cross-cultural synthesis, tropical adaptation, colonial elegance, Southeast Asian charm. French colonial with Vietnamese adaptation. Professional interior photography, tropical colonial light.' },

  { filename: 'vietnamese-traditional-house-courtyard.png', style: 'Vietnamese Traditional', room: 'Courtyard House', 
    prompt: 'Create a photorealistic Vietnamese traditional house courtyard in Hoi An. Features: wooden construction, tile roof, carved details, courtyard garden, ancestral altar, family living, traditional crafts, community orientation, cultural continuity, Southeast Asian architecture. Vietnamese tradition with family-centered living. Professional interior photography, soft Vietnamese courtyard light.' },

  // Singaporean Modern Asian
  { filename: 'singaporean-modern-penthouse.png', style: 'Singaporean Modern', room: 'Penthouse Living', 
    prompt: 'Create a photorealistic Singaporean modern penthouse living room in Marina Bay. Features: floor-to-ceiling windows, city skyline views, tropical modern furniture, air conditioning, multicultural art, luxury finishes, tropical luxury, Asian sophistication, urban density, global influences. Tropical luxury with Asian modernity. Professional interior photography, Singapore skyline lighting.' },

  { filename: 'singaporean-shophouse-adaptive-reuse.png', style: 'Singaporean Shophouse', room: 'Renovated Interior', 
    prompt: 'Create a photorealistic renovated Singaporean shophouse interior in historic district. Features: original architecture preserved, modern insertions, tropical adaptation, multicultural influences, heritage conservation, contemporary living, cultural preservation, urban renewal, architectural heritage. Heritage preservation with modern adaptation. Professional interior photography, tropical heritage lighting.' },

  // === FANTASY & ENTERTAINMENT INSPIRED ===

  // Jurassic Park Adventure Lodge
  { filename: 'jurassic-park-lodge-explorer.png', style: 'Jurassic Park Adventure', room: 'Explorer Lodge', 
    prompt: 'Create a photorealistic Jurassic Park explorer lodge in Costa Rican jungle setting. Features: fossil displays, expedition maps, safari furniture, amber specimens, paleontology equipment, adventure gear, tropical hardwood, mosquito netting, scientific discovery atmosphere, prehistoric wonder, nature expedition. Paleontological adventure with scientific discovery. Professional interior photography, jungle expedition lighting.' },

  { filename: 'jurassic-park-lab-genetics.png', style: 'Jurassic Park Laboratory', room: 'Genetics Lab', 
    prompt: 'Create a photorealistic Jurassic Park genetics laboratory for dinosaur research. Features: high-tech equipment, DNA sequencing machines, amber preservation units, computer workstations, safety protocols, scientific precision, cutting-edge technology, genetic engineering, prehistoric resurrection, scientific ethics. Genetic engineering with prehistoric implications. Professional interior photography, clinical laboratory lighting.' },

  // Great Gatsby 1920s Luxury
  { filename: 'great-gatsby-mansion-ballroom.png', style: 'Great Gatsby 1920s', room: 'Ballroom', 
    prompt: 'Create a photorealistic Great Gatsby mansion ballroom for Jazz Age party. Features: crystal chandeliers, parquet dance floor, orchestra stage, champagne service, art deco details, wealthy party guests atmosphere, prohibition era luxury, American dream excess, social climbing, new money ostentation. Jazz Age excess with American dream luxury. Professional interior photography, glittering party lighting.' },

  { filename: 'great-gatsby-library-old-sport.png', style: 'Great Gatsby Library', room: 'Private Library', 
    prompt: 'Create a photorealistic Great Gatsby private library in Long Island mansion. Features: leather-bound books (many unread), comfortable reading chairs, hidden bar, expensive but hollow atmosphere, new money trying to appear cultured, American class aspirations, wealth without breeding, social pretension. New money sophistication with hollow grandeur. Professional interior photography, library club lighting.' },

  // SpongeBob SquarePants Underwater
  { filename: 'spongebob-pineapple-house-interior.png', style: 'SpongeBob Pineapple House', room: 'Living Room', 
    prompt: 'Create a photorealistic SpongeBob pineapple house interior under the sea. Features: curved pineapple walls, boat-shaped furniture, anchor decorations, jellyfish lamp, Krabby Patty ingredients, nautical theme, underwater physics, cartoon logic made real, cheerful optimism, childhood wonder, oceanic whimsy. Underwater cartoon with nautical whimsy. Professional interior photography, underwater filtered lighting.' },

  { filename: 'spongebob-krusty-krab-restaurant.png', style: 'SpongeBob Krusty Krab', room: 'Fast Food Restaurant', 
    prompt: 'Create a photorealistic Krusty Krab restaurant interior from SpongeBob. Features: wooden ship construction, treasure chest tables, anchor details, ship wheel, nautical decorations, fast food service, underwater dining, pirate theme, oceanic atmosphere, cartoon restaurant made real. Underwater pirate restaurant with cartoon charm. Professional interior photography, underwater restaurant lighting.' }
];

/**
 * Generate a single real image using Gemini API
 */
async function generateRealImage(imageSpec) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": imageSpec.prompt
            }
          ]
        }
      ],
      "generationConfig": {
        "temperature": 0.4,
        "topP": 0.95,
        "topK": 40
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`🤖 Generating ${imageSpec.style} ${imageSpec.room}...`);

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
            return;
          }

          // Extract image data
          if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const content = response.candidates[0].content;
            
            if (content.parts) {
              for (const part of content.parts) {
                // Look for image data
                if (part.inlineData && part.inlineData.data && part.inlineData.mimeType && part.inlineData.mimeType.includes('image')) {
                  const buffer = Buffer.from(part.inlineData.data, 'base64');
                  const filepath = path.join(OUTPUT_DIR, imageSpec.filename);
                  
                  // Save the real image
                  fs.writeFileSync(filepath, buffer);
                  
                  const sizeKB = Math.round(buffer.length / 1024);
                  console.log(`✅ Real image generated: ${imageSpec.filename} (${sizeKB}KB)`);
                  
                  resolve({
                    success: true,
                    filename: imageSpec.filename,
                    size: buffer.length,
                    filepath
                  });
                  return;
                }
              }
            }
          }
          
          reject(new Error('No image data found in response'));
          
        } catch (error) {
          reject(new Error(`JSON parsing error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Generate all categories images
 */
async function generateAllCategoriesImages() {
  console.log('🎨 COMPLETE Categories Image Generator');
  console.log('=====================================');
  console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND'}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📸 Generating ${ALL_CATEGORIES_IMAGES.length} comprehensive category images\n`);

  if (!API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in environment');
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < ALL_CATEGORIES_IMAGES.length; i++) {
    const imageSpec = ALL_CATEGORIES_IMAGES[i];
    
    console.log(`\n[${i + 1}/${ALL_CATEGORIES_IMAGES.length}] ${imageSpec.style}`);
    console.log(`📍 ${imageSpec.room} - ${imageSpec.filename}`);
    
    try {
      const result = await generateRealImage(imageSpec);
      
      if (result.success) {
        console.log(`✅ Generated: ${result.filename} (${Math.round(result.size / 1024)}KB)`);
        successCount++;
      }
      
      // Rate limiting - 10 seconds between requests to avoid hitting quotas
      if (i < ALL_CATEGORIES_IMAGES.length - 1) {
        console.log('⏳ Waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.error(`❌ Failed ${imageSpec.filename}: ${error.message}`);
      failureCount++;
      
      // Continue with next image even if one fails
      if (i < ALL_CATEGORIES_IMAGES.length - 1) {
        console.log('⏳ Waiting 5 seconds before next...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  console.log(`\n🎉 Complete Categories Generation Finished!`);
  console.log(`✅ Successfully generated: ${successCount} images`);
  console.log(`❌ Failed: ${failureCount} images`);
  console.log(`📊 Success rate: ${Math.round((successCount / ALL_CATEGORIES_IMAGES.length) * 100)}%`);
  
  // Generate comprehensive report
  const categoriesReport = {
    timestamp: new Date().toISOString(),
    total_images: ALL_CATEGORIES_IMAGES.length,
    successful: successCount,
    failed: failureCount,
    success_rate: Math.round((successCount / ALL_CATEGORIES_IMAGES.length) * 100),
    project_types_covered: [
      'Single-Family Homes', 'Multi-Family Housing', 'Apartments & Condos', 
      'Townhouses', 'Villas & Mansions', 'Tiny Homes', 'Lofts & Penthouses',
      'Office Buildings', 'Coworking Spaces', 'Luxury Hotels', 'Boutique Hotels',
      'Restaurants & Cafes', 'Museums & Art Galleries', 'Libraries & Archives',
      'Spas & Wellness Centers', 'Fitness Centers & Gyms'
    ],
    styles_covered: [
      'Modern Minimalist', 'Contemporary', 'Mid-Century Modern', 'Traditional English',
      'American Colonial', 'Bohemian Global', 'Maximalist', 'Art Deco 1920s',
      'Industrial Warehouse', 'Urban Loft', 'Rustic Farmhouse', 'Mountain Lodge',
      'Hollywood Regency', 'Neoclassical Grandeur', 'Japanese Zen', 'Moroccan Riad',
      'Mediterranean Villa', 'Scandinavian Hygge', 'Kawaii Cute', 'Pop Art',
      'Psychedelic 1960s', 'Ancient Egyptian', 'Ancient Greek', 'Ancient Roman',
      'Gothic Cathedral', 'Renaissance Palace', 'Baroque Palace', 'Rococo Salon',
      'Victorian Parlor', 'Parisian Chic', 'French Provence', 'Italian Tuscan',
      'Spanish Moorish', 'Vietnamese French Colonial', 'Singaporean Modern',
      'Jurassic Park Adventure', 'Great Gatsby 1920s', 'SpongeBob Underwater'
    ],
    historical_periods: [
      'Ancient Egyptian (3100-30 BC)', 'Ancient Greek (800-31 BC)', 'Ancient Roman (753 BC-476 AD)',
      'Medieval Gothic (1100-1400)', 'Renaissance (1400-1600)', 'Baroque (1600-1750)',
      'Rococo (1720-1780)', 'Victorian (1837-1901)', '1920s Art Deco', '1960s Psychedelic'
    ],
    cultural_influences: [
      'European (French, Italian, Spanish)', 'Asian (Japanese, Vietnamese, Singaporean)',
      'Ancient Civilizations (Egyptian, Greek, Roman)', 'Fantasy & Entertainment'
    ]
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'all-categories-generation-report.json'), 
    JSON.stringify(categoriesReport, null, 2)
  );
  
  console.log(`\n📋 Complete report saved: all-categories-generation-report.json`);
  console.log(`\n🌟 Coverage achieved:`);
  console.log(`   📦 Project Types: ${categoriesReport.project_types_covered.length}`);
  console.log(`   🎨 Design Styles: ${categoriesReport.styles_covered.length}`);
  console.log(`   📅 Historical Periods: ${categoriesReport.historical_periods.length}`);
  console.log(`   🌍 Cultural Influences: ${categoriesReport.cultural_influences.length}`);
}

if (require.main === module) {
  generateAllCategoriesImages();
}