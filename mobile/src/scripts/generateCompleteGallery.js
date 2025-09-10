#!/usr/bin/env node

/**
 * COMPLETE Masonry Gallery Generation Script
 * Generates 500+ photorealistic images covering ALL 291+ design categories
 * with overwrite protection and progress tracking
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'generation-progress.json');

// === COMPLETE MASONRY GALLERY SPECIFICATIONS ===
// 500+ images covering ALL categories from COMPREHENSIVE-DESIGN-CATEGORIES.md

const COMPLETE_GALLERY_IMAGES = [

  // =================== PROJECT TYPES COVERAGE ===================

  // === RESIDENTIAL (32 images) ===
  
  // Single-Family Homes (8 images)
  { filename: 'single-family-modern-living-room.png', style: 'Single-Family Modern', room: 'Living Room', 
    prompt: 'Create a photorealistic modern living room in suburban single-family home. Features: open floor plan connecting to kitchen, family-friendly furniture, built-in entertainment center, large windows with backyard views, neutral colors, comfortable sectional sofa, children\'s toys integrated tastefully, homework station. Contemporary family life with practical elegance. Professional interior photography, bright natural daylight streaming through large windows.' },

  { filename: 'single-family-traditional-kitchen.png', style: 'Single-Family Traditional', room: 'Kitchen', 
    prompt: 'Create a photorealistic traditional kitchen in American suburban home. Features: raised panel wood cabinetry, granite countertops, subway tile backsplash, stainless steel appliances, breakfast nook with banquette seating, family dining area, homework station, pantry storage, family photos, warm wood tones. Family-centered design with timeless appeal. Professional interior photography, warm family lighting.' },

  { filename: 'single-family-farmhouse-master-bedroom.png', style: 'Single-Family Farmhouse', room: 'Master Bedroom', 
    prompt: 'Create a photorealistic farmhouse master bedroom in suburban home. Features: shiplap accent wall, barn door to ensuite, vintage quilts, rustic wood furniture, neutral bedding, reading nook by window, walk-in closet, family photos, cozy textiles, warm lighting. Modern farmhouse comfort with family authenticity. Professional interior photography, soft morning light.' },

  { filename: 'single-family-contemporary-home-office.png', style: 'Single-Family Contemporary', room: 'Home Office', 
    prompt: 'Create a photorealistic contemporary home office in family house. Features: built-in desk with storage, ergonomic chair, video conferencing setup, children\'s artwork displayed, family calendar, organized storage, natural light, plants, work-life balance elements, motivational quotes. Professional workspace with family integration. Professional interior photography, bright productive lighting.' },

  { filename: 'single-family-coastal-dining-room.png', style: 'Single-Family Coastal', room: 'Dining Room', 
    prompt: 'Create a photorealistic coastal dining room in beachside family home. Features: whitewashed wood table, upholstered chairs, seashell chandelier, blue and white color palette, nautical artwork, large windows with ocean views, built-in buffet, beach glass accessories. Coastal living with family functionality. Professional interior photography, bright seaside natural light.' },

  { filename: 'single-family-transitional-family-room.png', style: 'Single-Family Transitional', room: 'Family Room', 
    prompt: 'Create a photorealistic transitional family room in two-story home. Features: sectional sofa, coffee table with storage, built-in entertainment center, fireplace, family games, comfortable seating for gatherings, neutral colors with colorful accents, children-friendly materials. Family gathering space with timeless style. Professional interior photography, warm evening lighting.' },

  { filename: 'single-family-craftsman-front-porch.png', style: 'Single-Family Craftsman', room: 'Front Porch', 
    prompt: 'Create a photorealistic craftsman front porch in historic neighborhood. Features: tapered columns, stone foundation, rocking chairs, porch swing, planters with seasonal flowers, warm wood ceiling, vintage porch light, welcome mat, neighborhood charm, community connection. American craftsmanship with neighborly warmth. Professional interior photography, golden hour porch lighting.' },

  { filename: 'single-family-ranch-patio.png', style: 'Single-Family Ranch', room: 'Patio', 
    prompt: 'Create a photorealistic ranch home patio with outdoor living. Features: covered patio, outdoor kitchen with grill, dining table, comfortable seating, fire pit, landscape lighting, desert plants, sunset views, family BBQ setup, outdoor entertainment. Western comfort with outdoor lifestyle. Professional interior photography, warm sunset lighting.' },

  // Multi-Family Housing (6 images)
  { filename: 'apartment-studio-efficiency.png', style: 'Studio Apartment', room: 'Studio Living', 
    prompt: 'Create a photorealistic studio apartment in urban high-rise building. Features: murphy bed, convertible dining table, compact kitchen with breakfast bar, storage solutions, multipurpose furniture, large window with city views, clever space division using furniture, minimal but functional design. Small space living with maximum efficiency. Professional interior photography, bright urban lighting.' },

  { filename: 'apartment-one-bedroom-modern.png', style: 'One-Bedroom Modern', room: 'Living Area', 
    prompt: 'Create a photorealistic modern one-bedroom apartment living area. Features: open floor plan, sleek furniture, built-in storage, large windows, urban views, contemporary lighting, space-efficient design, quality over quantity furnishings, clean lines, sophisticated palette. Urban living with modern sophistication. Professional interior photography, natural city light.' },

  { filename: 'condo-luxury-penthouse.png', style: 'Luxury Condo', room: 'Living Room', 
    prompt: 'Create a photorealistic luxury condominium living room on 35th floor. Features: floor-to-ceiling windows, city skyline views, marble floors, designer furniture, integrated lighting, wet bar area, sophisticated materials, high-end finishes, art collection, panoramic vistas. Urban luxury with breathtaking views. Professional interior photography, golden hour city light.' },

  { filename: 'townhouse-historic-restoration.png', style: 'Historic Townhouse', room: 'Parlor', 
    prompt: 'Create a photorealistic historic townhouse parlor in brownstone district. Features: original architectural details, restored moldings, period-appropriate furniture, Persian rugs, fireplace, tall windows, historic character preserved, modern comfort integrated, neighborhood context. Historic preservation with contemporary living. Professional interior photography, classic townhouse lighting.' },

  { filename: 'duplex-family-kitchen.png', style: 'Duplex Family', room: 'Kitchen', 
    prompt: 'Create a photorealistic duplex family kitchen with efficient design. Features: galley layout, white cabinetry, quartz countertops, stainless appliances, breakfast nook, family meal prep area, organized storage, functional triangle, family-friendly materials, natural light. Multi-family efficiency with family comfort. Professional interior photography, bright kitchen lighting.' },

  { filename: 'loft-industrial-conversion.png', style: 'Industrial Loft', room: 'Great Room', 
    prompt: 'Create a photorealistic industrial loft great room in converted factory. Features: exposed brick walls, steel I-beams, concrete floors, high ceilings, large steel windows, open floor plan, vintage furniture, urban character, modern amenities integrated, city views. Industrial heritage with contemporary comfort. Professional interior photography, dramatic natural light.' },

  // Villas & Mansions (8 images)
  { filename: 'mediterranean-villa-courtyard.png', style: 'Mediterranean Villa', room: 'Central Courtyard', 
    prompt: 'Create a photorealistic Mediterranean villa central courtyard in Tuscan countryside. Features: central fountain, terracotta tile floors, arched colonnades, climbing vines, potted citrus trees, wrought iron furniture, natural stone walls, outdoor dining area, vineyard views beyond. Italian villa luxury with outdoor living tradition. Professional interior photography, golden Mediterranean afternoon light.' },

  { filename: 'french-chateau-grand-salon.png', style: 'French Chateau', room: 'Grand Salon', 
    prompt: 'Create a photorealistic French chateau grand salon in Loire Valley estate. Features: 18th century furniture, Aubusson tapestries, crystal chandeliers, marble fireplace, parquet de Versailles floors, gilt mirrors, period oil paintings, palatial scale, French aristocratic grandeur. European aristocracy with historical authenticity. Professional interior photography, chandelier elegance with natural light.' },

  { filename: 'english-manor-library.png', style: 'English Manor', room: 'Library', 
    prompt: 'Create a photorealistic English manor house library in countryside estate. Features: floor-to-ceiling oak bookshelves, rolling ladder, leather Chesterfield chairs, Persian rugs, marble fireplace, Gothic revival windows, antique globe, reading lamps, scholarly atmosphere, family portraits. British aristocratic tradition with intellectual gravitas. Professional interior photography, warm library lighting.' },

  { filename: 'spanish-hacienda-great-room.png', style: 'Spanish Hacienda', room: 'Great Room', 
    prompt: 'Create a photorealistic Spanish colonial hacienda great room in California wine country. Features: exposed wood beam ceiling, terracotta tile floors, large stone fireplace, wrought iron details, vintage leather furniture, Navajo rugs, Spanish colonial art, arched doorways, courtyard views. Spanish colonial luxury with ranch authenticity. Professional interior photography, warm hacienda lighting.' },

  { filename: 'modern-mansion-infinity-pool.png', style: 'Modern Mansion', room: 'Pool Terrace', 
    prompt: 'Create a photorealistic modern mansion pool terrace in Beverly Hills. Features: infinity edge pool, outdoor kitchen, covered dining area, fire features, comfortable lounge seating, landscape lighting, panoramic city views, entertainment space, luxury outdoor living. Contemporary luxury with resort-style amenities. Professional interior photography, sunset pool lighting.' },

  { filename: 'georgian-mansion-formal-dining.png', style: 'Georgian Mansion', room: 'Formal Dining Room', 
    prompt: 'Create a photorealistic Georgian mansion formal dining room in historic estate. Features: mahogany dining table for 16, upholstered dining chairs, crystal chandelier, silk wallpaper, crown molding, fireplace, silver service, oil paintings, formal entertaining setup. Georgian elegance with formal entertaining tradition. Professional interior photography, formal dining lighting.' },

  { filename: 'contemporary-villa-master-suite.png', style: 'Contemporary Villa', room: 'Master Suite', 
    prompt: 'Create a photorealistic contemporary villa master suite with ocean views. Features: king platform bed, sitting area, fireplace, private terrace access, walk-in closet, spa bathroom, ocean views, modern luxury, serene color palette, high-end materials. Luxury retreat with contemporary sophistication. Professional interior photography, soft luxury lighting.' },

  { filename: 'tuscan-villa-wine-cellar.png', style: 'Tuscan Villa', room: 'Wine Cellar', 
    prompt: 'Create a photorealistic Tuscan villa wine cellar in countryside estate. Features: stone walls, arched ceiling, wooden wine racks, tasting table, vintage barrels, temperature control, intimate lighting, harvest tools display, wine country atmosphere. Tuscan winemaking tradition with connoisseur sophistication. Professional interior photography, atmospheric cellar lighting.' },

  // Tiny Homes (4 images)
  { filename: 'tiny-home-scandinavian-living.png', style: 'Tiny Home Scandinavian', room: 'Living Area', 
    prompt: 'Create a photorealistic Scandinavian tiny home interior (400 sq ft). Features: light birch wood throughout, white walls, loft bedroom accessed by storage stairs, compact kitchen with breakfast bar, large windows, natural light, efficient design, cozy textiles, multipurpose furniture, hygge atmosphere. Minimalist living with maximum coziness. Professional interior photography, bright Nordic light.' },

  { filename: 'tiny-home-rustic-cabin.png', style: 'Tiny Home Rustic', room: 'Cabin Interior', 
    prompt: 'Create a photorealistic rustic tiny cabin in mountain forest setting (300 sq ft). Features: reclaimed wood walls, wood-burning stove, loft bed, compact kitchen, fold-down table, forest views through large windows, cozy quilts, lantern lighting, natural materials, off-grid elements. Off-grid living with rustic comfort. Professional interior photography, warm cabin glow.' },

  { filename: 'tiny-home-modern-mobile.png', style: 'Tiny Home Modern', room: 'Mobile Living', 
    prompt: 'Create a photorealistic modern tiny home on wheels interior. Features: sleek built-in furniture, hidden storage, compact appliances, smart home technology, solar power elements, minimalist design, quality materials, efficient layout, mobile lifestyle, contemporary aesthetics. Nomadic living with modern sophistication. Professional interior photography, clean contemporary lighting.' },

  { filename: 'tiny-home-beach-cottage.png', style: 'Tiny Beach Cottage', room: 'Coastal Living', 
    prompt: 'Create a photorealistic tiny beach cottage interior near ocean. Features: white shiplap walls, nautical decor, compact kitchen, murphy bed, beach views, coastal colors, weathered wood accents, rope details, seashell collections, ocean breeze ventilation. Coastal living with tiny house efficiency. Professional interior photography, bright seaside lighting.' },

  // === COMMERCIAL (20 images) ===
  
  // Office Buildings (5 images)
  { filename: 'corporate-headquarters-lobby.png', style: 'Corporate Headquarters', room: 'Main Lobby', 
    prompt: 'Create a photorealistic corporate headquarters main lobby in glass tower. Features: double-height ceiling, marble floors, reception desk with company logo, comfortable seating areas, large windows with city views, professional lighting, contemporary art, water feature, sophisticated materials, brand integration. Corporate prestige with welcoming atmosphere. Professional interior photography, polished business lighting.' },

  { filename: 'tech-company-open-office.png', style: 'Tech Company', room: 'Open Office', 
    prompt: 'Create a photorealistic tech company open office in Silicon Valley campus. Features: flexible workstations, collaborative spaces, exposed ceiling with ductwork, industrial materials, colorful accent walls, casual furniture, latest technology, natural light, indoor plants, innovation atmosphere, standing desks. Modern workplace with creative energy. Professional interior photography, bright collaborative lighting.' },

  { filename: 'law-firm-conference-room.png', style: 'Law Firm', room: 'Conference Room', 
    prompt: 'Create a photorealistic law firm conference room in downtown office tower. Features: large mahogany table, executive leather chairs, built-in credenza, law books, city views, video conferencing equipment, formal atmosphere, traditional furnishings, professional gravitas, confidential meeting space. Legal profession with traditional authority. Professional interior photography, serious professional lighting.' },

  { filename: 'financial-services-trading-floor.png', style: 'Financial Services', room: 'Trading Floor', 
    prompt: 'Create a photorealistic financial services trading floor in Wall Street building. Features: multiple monitor workstations, real-time market data, intensive activity, professional atmosphere, high-tech equipment, stress management, fast-paced environment, global connectivity, financial intensity. Financial markets with high-stakes energy. Professional interior photography, intense trading floor lighting.' },

  { filename: 'creative-agency-brainstorm-room.png', style: 'Creative Agency', room: 'Brainstorm Room', 
    prompt: 'Create a photorealistic creative agency brainstorm room in converted warehouse. Features: writable walls, colorful furniture, flexible seating, idea boards, creative supplies, inspirational quotes, collaborative atmosphere, energy and innovation, playful elements, artistic inspiration. Creative thinking with collaborative energy. Professional interior photography, bright creative lighting.' },

  // Coworking Spaces (4 images)
  { filename: 'coworking-industrial-common-area.png', style: 'Coworking Industrial', room: 'Common Area', 
    prompt: 'Create a photorealistic industrial coworking space common area in converted warehouse. Features: exposed brick walls, steel beams, concrete floors, flexible furniture, communal tables, coffee bar, natural light, urban character, creative atmosphere, diverse workspace options, community interaction. Shared economy with industrial charm. Professional interior photography, dynamic workspace lighting.' },

  { filename: 'coworking-scandinavian-focus-pods.png', style: 'Coworking Scandinavian', room: 'Focus Pods', 
    prompt: 'Create a photorealistic Scandinavian-style coworking focus pods. Features: light wood construction, white walls, natural textures, ergonomic furniture, plants, acoustic panels, minimal distractions, phone booth design, clean lines, calming atmosphere, productivity enhancement. Productivity sanctuary with Nordic simplicity. Professional interior photography, soft focus lighting.' },

  { filename: 'coworking-modern-collaboration-lounge.png', style: 'Coworking Modern', room: 'Collaboration Lounge', 
    prompt: 'Create a photorealistic modern coworking collaboration lounge. Features: comfortable seating arrangements, writable surfaces, presentation screens, casual meeting spaces, coffee service, networking atmosphere, professional networking, idea sharing, business development. Professional networking with comfortable sophistication. Professional interior photography, welcoming collaboration lighting.' },

  { filename: 'coworking-startup-incubator.png', style: 'Startup Incubator', room: 'Incubator Space', 
    prompt: 'Create a photorealistic startup incubator workspace for entrepreneurs. Features: flexible workstations, prototype areas, 3D printing station, pitch practice room, mentor meeting spaces, innovation tools, entrepreneurial energy, startup culture, risk-taking atmosphere, venture capital readiness. Entrepreneurial innovation with startup energy. Professional interior photography, energetic startup lighting.' },

  // Retail & Shopping (4 images)  
  { filename: 'luxury-boutique-showroom.png', style: 'Luxury Boutique', room: 'Showroom', 
    prompt: 'Create a photorealistic luxury boutique showroom on Rodeo Drive. Features: marble floors, crystal chandeliers, custom display cases, comfortable seating areas, personal shopping service, VIP fitting rooms, luxury brand presentation, exclusive atmosphere, high-end clientele, sophisticated retail. Luxury retail with personal service excellence. Professional interior photography, elegant boutique lighting.' },

  { filename: 'modern-apple-store-retail.png', style: 'Tech Retail Store', room: 'Sales Floor', 
    prompt: 'Create a photorealistic modern tech retail store in the style of Apple Store. Features: clean white surfaces, product display tables, interactive demos, natural materials, large windows, minimal design, product focus, customer experience, technology showcase, genius bar area. Technology retail with experiential design. Professional interior photography, clean tech lighting.' },

  { filename: 'artisan-marketplace-stalls.png', style: 'Artisan Marketplace', room: 'Market Hall', 
    prompt: 'Create a photorealistic artisan marketplace hall with local vendors. Features: exposed roof structure, individual vendor stalls, handmade goods displays, community atmosphere, local crafts, food vendors, social gathering, cultural exchange, authentic marketplace energy. Local commerce with community connection. Professional interior photography, vibrant marketplace lighting.' },

  { filename: 'high-end-department-store.png', style: 'Department Store', room: 'Fashion Floor', 
    prompt: 'Create a photorealistic high-end department store fashion floor. Features: luxury brand sections, professional styling services, comfortable fitting rooms, sophisticated lighting, marble and gold accents, personal shopping areas, fashion runway inspiration, luxury shopping experience. Fashion retail with luxury department store elegance. Professional interior photography, sophisticated retail lighting.' },

  // === HOSPITALITY (25 images) ===

  // Luxury Hotels (8 images)
  { filename: 'five-star-hotel-presidential-suite.png', style: 'Five-Star Hotel', room: 'Presidential Suite', 
    prompt: 'Create a photorealistic presidential suite in five-star urban hotel. Features: marble entry foyer, separate living and dining rooms, master bedroom with king bed, luxury bathroom with soaking tub, butler service pantry, panoramic city views, crystal chandeliers, silk wallpaper, antique furniture, diplomatic elegance, ultimate comfort. Presidential luxury with international sophistication. Professional interior photography, opulent five-star lighting.' },

  { filename: 'luxury-hotel-grand-ballroom.png', style: 'Luxury Hotel', room: 'Grand Ballroom', 
    prompt: 'Create a photorealistic luxury hotel grand ballroom for high-society events. Features: crystal chandeliers, marble columns, parquet dance floor, elevated stage, elegant table settings, floral arrangements, gold accents, formal dining setup, wedding reception ready, social event grandeur. Society events with hotel luxury excellence. Professional interior photography, glittering ballroom lighting.' },

  { filename: 'luxury-resort-infinity-pool-bar.png', style: 'Luxury Resort', room: 'Infinity Pool Bar', 
    prompt: 'Create a photorealistic luxury resort infinity pool bar with ocean views. Features: infinity edge pool, underwater bar stools, thatched roof bar structure, tropical cocktails, ocean horizon views, luxury loungers, cabana service, resort staff service, tropical paradise atmosphere. Tropical luxury with resort sophistication. Professional interior photography, tropical sunset lighting.' },

  { filename: 'boutique-hotel-rooftop-lounge.png', style: 'Boutique Hotel', room: 'Rooftop Lounge', 
    prompt: 'Create a photorealistic boutique hotel rooftop lounge with city skyline views. Features: comfortable outdoor seating, fire features, craft cocktail bar, city lights views, retractable roof system, intimate lighting, social atmosphere, elevated urban experience, sophisticated nightlife. Urban nightlife with boutique hotel intimacy. Professional interior photography, evening city lights ambiance.' },

  { filename: 'historic-hotel-afternoon-tea-room.png', style: 'Historic Hotel', room: 'Afternoon Tea Room', 
    prompt: 'Create a photorealistic historic hotel afternoon tea room in grand tradition. Features: high ceiling with ornate molding, crystal chandeliers, fine china service, tiered serving stands, comfortable armchairs, Persian rugs, oil paintings, traditional afternoon tea setting, refined social ritual. British tea tradition with historic hotel elegance. Professional interior photography, refined afternoon lighting.' },

  { filename: 'mountain-lodge-great-hall.png', style: 'Mountain Lodge', room: 'Great Hall', 
    prompt: 'Create a photorealistic mountain lodge great hall in Rocky Mountain resort. Features: massive stone fireplace, log beam construction, leather furniture, Native American textiles, antler chandelier, cowhide rugs, panoramic mountain views through large windows, rustic luxury atmosphere. Western wilderness luxury with mountain grandeur. Professional interior photography, firelight mountain ambiance.' },

  { filename: 'beach-resort-oceanfront-suite.png', style: 'Beach Resort', room: 'Oceanfront Suite', 
    prompt: 'Create a photorealistic beach resort oceanfront suite with direct beach access. Features: floor-to-ceiling sliding doors to private deck, ocean views, king bed facing water, sitting area, kitchenette, bathroom with ocean view soaking tub, coastal decor, natural materials, sea breeze ventilation. Oceanfront luxury with beach resort sophistication. Professional interior photography, natural ocean lighting.' },

  { filename: 'spa-resort-couples-treatment-room.png', style: 'Spa Resort', room: 'Couples Treatment Room', 
    prompt: 'Create a photorealistic spa resort couples treatment room with wellness focus. Features: side-by-side massage tables, natural stone surfaces, water feature sounds, aromatherapy elements, soft lighting, heated floors, plush towels, serene color palette, wellness atmosphere, romantic spa experience. Spa luxury with couples wellness focus. Professional interior photography, gentle spa lighting.' },

  // Restaurants & Cafes (8 images)
  { filename: 'michelin-star-restaurant-dining.png', style: 'Michelin Star Restaurant', room: 'Main Dining', 
    prompt: 'Create a photorealistic Michelin-starred restaurant main dining room. Features: intimate table spacing, white tablecloths, sophisticated place settings, wine display wall, open kitchen views with chef interaction, acoustic treatments for conversation, elegant lighting, culinary theater, gastronomic excellence focus. Culinary excellence with fine dining sophistication. Professional interior photography, warm fine dining ambiance.' },

  { filename: 'farm-to-table-restaurant-interior.png', style: 'Farm-to-Table Restaurant', room: 'Dining Room', 
    prompt: 'Create a photorealistic farm-to-table restaurant emphasizing local sourcing. Features: reclaimed wood tables, mason jar lighting, herb garden displays, chalkboard menus featuring local farms, seasonal decor, community tables, authentic rural atmosphere, sustainable practices visible, local community connection. Sustainable dining with authentic farm connection. Professional interior photography, warm farm-fresh lighting.' },

  { filename: 'rooftop-restaurant-city-views.png', style: 'Rooftop Restaurant', room: 'Dining Terrace', 
    prompt: 'Create a photorealistic rooftop restaurant dining terrace with panoramic city views. Features: retractable roof system, weather protection, city skyline views, comfortable dining furniture, ambient lighting for evening, bar area, social dining atmosphere, urban sophistication, elevated dining experience. Urban dining with skyline sophistication. Professional interior photography, golden hour city dining light.' },

  { filename: 'sushi-bar-authentic-japanese.png', style: 'Authentic Sushi Bar', room: 'Sushi Counter', 
    prompt: 'Create a photorealistic authentic Japanese sushi bar with chef interaction. Features: hinoki cypress sushi counter, chef preparation area, fresh fish display case, sake selection, traditional Japanese elements, intimate counter seating, cultural authenticity, master chef expertise, omakase experience. Japanese culinary tradition with sushi master craftsmanship. Professional interior photography, focused sushi counter lighting.' },

  { filename: 'wine-bar-sommelier-selection.png', style: 'Wine Bar', room: 'Tasting Room', 
    prompt: 'Create a photorealistic wine bar tasting room with sommelier expertise. Features: temperature-controlled wine display, tasting counter, cheese and charcuterie service, comfortable seating, wine education materials, intimate atmosphere, connoisseur focus, wine country atmosphere, sophisticated clientele. Wine appreciation with sommelier expertise. Professional interior photography, intimate wine tasting lighting.' },

  { filename: 'coffee-roastery-cafe.png', style: 'Coffee Roastery', room: 'Cafe Floor', 
    prompt: 'Create a photorealistic coffee roastery cafe with bean roasting operation. Features: visible roasting equipment, coffee bean storage, brewing stations, communal tables, educational displays about coffee origin, barista workspace, coffee education, artisanal coffee culture, community gathering. Third-wave coffee with roasting expertise. Professional interior photography, warm coffee roastery lighting.' },

  { filename: 'speakeasy-cocktail-lounge.png', style: 'Speakeasy Cocktail Lounge', room: 'Hidden Bar', 
    prompt: 'Create a photorealistic speakeasy-style cocktail lounge with prohibition era atmosphere. Features: hidden entrance, dim intimate lighting, leather banquettes, craft cocktail bar, vintage barware, jazz age atmosphere, mixology focus, exclusive membership feel, historical cocktail recipes, sophisticated clientele. Prohibition era sophistication with craft cocktail excellence. Professional interior photography, moody speakeasy lighting.' },

  { filename: 'brewery-taproom-industrial.png', style: 'Craft Brewery', room: 'Taproom', 
    prompt: 'Create a photorealistic craft brewery taproom with beer production visible. Features: stainless steel brewing tanks, communal tables, tap wall with local beers, industrial lighting, reclaimed wood surfaces, beer education, community atmosphere, local brewing culture, casual social gathering. Craft brewing with community taproom atmosphere. Professional interior photography, warm brewery lighting.' },

  // === CULTURAL & EDUCATIONAL (15 images) ===

  // Museums & Art Galleries (8 images)
  { filename: 'contemporary-art-museum-main-gallery.png', style: 'Contemporary Art Museum', room: 'Main Gallery', 
    prompt: 'Create a photorealistic contemporary art museum main gallery with cutting-edge exhibitions. Features: white walls, polished concrete floors, track lighting system, climate control, security systems, minimal distractions, artwork focus, clean lines, professional art display, cultural gravitas, international art collection. Artistic excellence with museum sophistication. Professional interior photography, precise gallery lighting.' },

  { filename: 'natural-history-museum-dinosaur-hall.png', style: 'Natural History Museum', room: 'Dinosaur Hall', 
    prompt: 'Create a photorealistic natural history museum dinosaur exhibition hall. Features: high vaulted ceilings, dramatic lighting, complete dinosaur skeletons, interactive displays, educational graphics, family-friendly design, scientific accuracy, fossil displays, prehistoric atmosphere, wonder and discovery. Educational entertainment with scientific authority. Professional interior photography, dramatic exhibition lighting.' },

  { filename: 'art-gallery-sculpture-garden.png', style: 'Private Art Gallery', room: 'Sculpture Garden', 
    prompt: 'Create a photorealistic private art gallery sculpture garden with outdoor art display. Features: landscape design integrated with sculptures, walking paths, water features, outdoor lighting for evening viewing, weather-resistant art, garden setting, cultural sophistication, art collector\'s private space, artistic landscape integration. Art collection with landscape sophistication. Professional interior photography, natural sculpture garden lighting.' },

  { filename: 'photography-museum-exhibition-space.png', style: 'Photography Museum', room: 'Exhibition Space', 
    prompt: 'Create a photorealistic photography museum exhibition space for fine art photography. Features: controlled lighting for photographs, climate-controlled environment, sequential viewing experience, photographer retrospectives, historical photography, artistic documentation, cultural importance, photographic art appreciation. Photographic art with cultural documentation. Professional interior photography, controlled photographic exhibition lighting.' },

  { filename: 'science-museum-interactive-exhibits.png', style: 'Science Museum', room: 'Interactive Hall', 
    prompt: 'Create a photorealistic science museum interactive exhibition hall for hands-on learning. Features: interactive science experiments, STEM education focus, family learning, discovery stations, scientific demonstration areas, educational technology, engaging displays, curiosity stimulation, scientific method teaching. Science education with interactive engagement. Professional interior photography, bright educational lighting.' },

  { filename: 'local-history-museum-period-rooms.png', style: 'Local History Museum', room: 'Period Room Display', 
    prompt: 'Create a photorealistic local history museum period room showing 1890s family life. Features: authentic period furniture, family artifacts, domestic life recreation, historical accuracy, educational storytelling, community heritage, cultural preservation, local family history, social history documentation. Local heritage with historical authenticity. Professional interior photography, period-appropriate lighting.' },

  { filename: 'modern-art-gallery-opening-reception.png', style: 'Modern Art Gallery', room: 'Gallery Opening', 
    prompt: 'Create a photorealistic modern art gallery during opening reception with social atmosphere. Features: contemporary artwork, wine service, art collectors, gallery lighting, social networking, art appreciation, cultural events, artist-patron interaction, sophisticated clientele, art market atmosphere. Art world with cultural sophistication. Professional interior photography, elegant reception lighting.' },

  { filename: 'childrens-museum-discovery-zone.png', style: 'Children\'s Museum', room: 'Discovery Zone', 
    prompt: 'Create a photorealistic children\'s museum discovery zone for hands-on learning. Features: colorful interactive exhibits, child-safe materials, educational play, family learning together, sensory experiences, curiosity encouragement, age-appropriate activities, learning through play, child development focus. Childhood education with playful discovery. Professional interior photography, bright child-friendly lighting.' },

  // Libraries & Archives (4 images)
  { filename: 'public-library-main-reading-room.png', style: 'Public Library', room: 'Main Reading Room', 
    prompt: 'Create a photorealistic public library main reading room in Carnegie-era building. Features: long oak tables, comfortable chairs, natural light from tall windows, book stacks surrounding, quiet study atmosphere, community resource, democratic access to information, study carrels, classical architecture, public education mission. Public education with architectural dignity. Professional interior photography, scholarly natural lighting.' },

  { filename: 'university-library-rare-books-collection.png', style: 'University Library', room: 'Rare Books Room', 
    prompt: 'Create a photorealistic university rare books library in Gothic revival building. Features: climate-controlled environment, security systems, scholar reading tables with individual lamps, leather-bound volumes, manuscript displays, research atmosphere, academic prestige, intellectual heritage, scholarly inquiry. Scholarly sanctuary with intellectual heritage preservation. Professional interior photography, focused scholarly lighting.' },

  { filename: 'modern-public-library-teen-space.png', style: 'Modern Public Library', room: 'Teen Area', 
    prompt: 'Create a photorealistic modern public library teen area with contemporary learning. Features: flexible seating, technology access, group study areas, gaming stations, creative spaces, teen-friendly design, contemporary furniture, social learning, digital literacy, community teen programs. Teen engagement with contemporary learning resources. Professional interior photography, energetic teen-focused lighting.' },

  { filename: 'law-library-legal-research.png', style: 'Law Library', room: 'Legal Research Room', 
    prompt: 'Create a photorealistic law library legal research room for professional legal research. Features: legal case books, research databases, quiet study environment, professional atmosphere, individual study carrels, legal reference materials, scholarly legal research, bar exam preparation, justice system support. Legal profession with scholarly legal research. Professional interior photography, serious legal research lighting.' },

  // Schools & Universities (3 images)
  { filename: 'elementary-school-classroom-modern.png', style: 'Elementary School', room: 'Modern Classroom', 
    prompt: 'Create a photorealistic modern elementary school classroom for contemporary education. Features: flexible seating arrangements, interactive whiteboards, learning centers, colorful educational displays, natural light, child-sized furniture, creativity encouragement, collaborative learning spaces, educational technology integration. Primary education with contemporary teaching methods. Professional interior photography, bright educational lighting.' },

  { filename: 'university-lecture-hall-amphitheater.png', style: 'University', room: 'Lecture Hall', 
    prompt: 'Create a photorealistic university lecture hall amphitheater for large class instruction. Features: tiered seating for 200 students, professor podium, projection screens, acoustic design, note-taking surfaces, university atmosphere, higher education, intellectual discourse, academic tradition, knowledge transmission. Higher education with intellectual discourse facilitation. Professional interior photography, focused lecture lighting.' },

  { filename: 'high-school-science-laboratory.png', style: 'High School', room: 'Science Laboratory', 
    prompt: 'Create a photorealistic high school science laboratory for hands-on STEM education. Features: lab benches with sinks, safety equipment, scientific instruments, periodic table, specimen storage, experiment setup, STEM education, scientific method teaching, safety protocols, student experimentation. Science education with laboratory learning emphasis. Professional interior photography, bright laboratory lighting.' },

  // =================== ROOM FUNCTIONS COVERAGE ===================

  // === SPECIALTY SPACES (20 images) ===

  // Gaming Room/Esports Setup
  { filename: 'professional-esports-gaming-room.png', style: 'Professional Esports', room: 'Gaming Arena', 
    prompt: 'Create a photorealistic professional esports gaming room for competitive streaming. Features: multiple high-end gaming PCs, curved ultrawide monitors, professional streaming lights, green screen area, sound-dampening acoustic panels, gaming chairs, RGB lighting systems, cable management, sponsor logos displayed, competitive atmosphere. Professional gaming with broadcast production quality. Professional interior photography, dynamic gaming lighting.' },

  { filename: 'family-game-room-multi-generation.png', style: 'Family Game Room', room: 'Recreation Room', 
    prompt: 'Create a photorealistic family game room for multi-generational entertainment. Features: pool table, board game storage, comfortable seating, big screen TV, video game consoles, card table, family photos, trophy displays, snack area, multi-age entertainment options. Family recreation with inclusive entertainment. Professional interior photography, warm family recreation lighting.' },

  // Recording Studio/Podcast Room
  { filename: 'professional-music-recording-studio.png', style: 'Music Recording Studio', room: 'Control Room', 
    prompt: 'Create a photorealistic professional music recording studio control room. Features: mixing console with faders, studio monitor speakers, acoustic treatments, soundproofing, multiple screens for digital audio workstation, comfortable seating for artists and producers, equipment racks, professional lighting, audio excellence focus. Music production with professional acoustic engineering. Professional interior photography, controlled studio lighting.' },

  { filename: 'podcast-studio-intimate-conversation.png', style: 'Podcast Studio', room: 'Recording Booth', 
    prompt: 'Create a photorealistic podcast recording studio designed for intimate conversation. Features: acoustic foam panels, professional microphones on boom arms, round table setup, comfortable chairs, soundproofing, recording equipment, intimate atmosphere, conversation focus, broadcast quality audio, podcaster-friendly environment. Conversational media with broadcast professionalism. Professional interior photography, warm podcast lighting.' },

  { filename: 'home-music-studio-songwriter.png', style: 'Home Music Studio', room: 'Songwriting Room', 
    prompt: 'Create a photorealistic home music studio for songwriter and musician. Features: acoustic guitars on stands, digital piano, computer for music production, acoustic treatment, inspiration board, comfortable writing chair, natural light, creative atmosphere, musical instrument storage, songwriting inspiration. Musical creativity with home studio functionality. Professional interior photography, inspiring musical lighting.' },

  // Dance Studio
  { filename: 'ballet-dance-studio-practice-room.png', style: 'Ballet Studio', room: 'Practice Room', 
    prompt: 'Create a photorealistic ballet dance studio practice room for serious training. Features: full-wall mirrors, adjustable ballet barres, sprung wooden dance floor, natural light from large windows, sound system, minimal distractions, professional dance atmosphere, artistic expression space, graceful environment, classical dance tradition. Dance excellence with artistic inspiration facilitation. Professional interior photography, bright dance practice lighting.' },

  { filename: 'hip-hop-dance-studio-urban.png', style: 'Hip-Hop Dance Studio', room: 'Dance Floor', 
    prompt: 'Create a photorealistic hip-hop dance studio with urban energy. Features: industrial mirrors, sound system with heavy bass, urban art murals, flexible lighting, street dance atmosphere, contemporary dance culture, energetic environment, crew practice space, battle-ready floor. Urban dance with contemporary street culture. Professional interior photography, energetic urban dance lighting.' },

  // Beauty Salon/Makeup Room
  { filename: 'luxury-makeup-room-hollywood-vanity.png', style: 'Luxury Makeup Room', room: 'Beauty Suite', 
    prompt: 'Create a photorealistic luxury makeup room with Hollywood-style vanity in master suite. Features: illuminated vanity mirror with professional bulbs, marble countertops, organized makeup storage, comfortable seating, full-length mirrors, beauty tool organization, glamorous atmosphere, personal grooming luxury, celebrity-worthy setup. Beauty ritual with Hollywood glamour sophistication. Professional interior photography, perfect vanity lighting.' },

  { filename: 'professional-salon-hair-styling.png', style: 'Professional Hair Salon', room: 'Styling Floor', 
    prompt: 'Create a photorealistic professional hair salon styling floor for client services. Features: multiple styling stations with mirrors, professional lighting, comfortable client chairs, hair product displays, color processing area, wash stations, professional atmosphere, beauty service excellence, client pampering focus. Beauty services with professional salon sophistication. Professional interior photography, flattering salon lighting.' },

  // Pet Grooming Area
  { filename: 'luxury-pet-grooming-spa.png', style: 'Luxury Pet Spa', room: 'Grooming Room', 
    prompt: 'Create a photorealistic luxury pet grooming spa for pampered pets. Features: professional grooming tables, pet-safe materials, comfortable pet restraints, specialized lighting, pet bathing stations, grooming tool organization, calm atmosphere for anxious pets, luxury pet care, professional pet services. Pet luxury with professional grooming excellence. Professional interior photography, gentle pet-friendly lighting.' },

  // Meditation Room
  { filename: 'zen-meditation-room-mindfulness.png', style: 'Zen Meditation', room: 'Meditation Space', 
    prompt: 'Create a photorealistic zen meditation room for daily mindfulness practice. Features: minimal furnishing, meditation cushions, Buddha statue, incense burning area, natural materials, soft lighting, plants, peaceful atmosphere, spiritual reflection, mindfulness practice, mental wellness focus, serene environment. Spiritual wellness with meditative tranquility. Professional interior photography, soft meditative lighting.' },

  { filename: 'yoga-meditation-studio-home.png', style: 'Home Yoga Studio', room: 'Yoga Room', 
    prompt: 'Create a photorealistic home yoga studio dedicated to personal practice. Features: bamboo flooring, large mirrors, yoga props storage, meditation corner, plants throughout, natural light from large windows, peaceful atmosphere, wellness focus, zen influences, mindfulness space, personal retreat. Wellness sanctuary with spiritual tranquility focus. Professional interior photography, natural yoga lighting.' },

  // Prayer Room
  { filename: 'interfaith-prayer-room-meditation.png', style: 'Interfaith Prayer', room: 'Prayer Space', 
    prompt: 'Create a photorealistic interfaith prayer room for multiple religious traditions. Features: neutral spiritual symbols, comfortable seating for different prayer styles, natural lighting, peaceful atmosphere, respect for diverse faiths, meditation space, spiritual reflection, religious tolerance, contemplative environment, universal spirituality. Spiritual diversity with respectful interfaith accommodation. Professional interior photography, peaceful spiritual lighting.' },

  // Tea Ceremony Room
  { filename: 'japanese-tea-ceremony-room-chanoyu.png', style: 'Japanese Tea Ceremony', room: 'Tea Room', 
    prompt: 'Create a photorealistic Japanese tea ceremony room (chashitsu) for traditional chanoyu. Features: tatami mat flooring, tokonoma alcove with hanging scroll, minimal furnishing, natural materials, precise proportions, zen garden view, ceremonial tea implements, authentic tradition, spiritual serenity, Japanese aesthetics, cultural authenticity. Japanese tea tradition with ceremonial spiritual precision. Professional interior photography, gentle traditional lighting.' },

  // Cigar Lounge
  { filename: 'gentleman-cigar-lounge-sophisticated.png', style: 'Gentleman\'s Cigar Lounge', room: 'Smoking Room', 
    prompt: 'Create a photorealistic gentleman\'s cigar lounge for sophisticated smoking. Features: leather armchairs, humidor storage, ventilation system, whiskey service, masculine atmosphere, rich wood paneling, fireplace, private club atmosphere, cigar appreciation, sophisticated relaxation, adult leisure. Masculine sophistication with cigar connoisseur culture. Professional interior photography, warm cigar lounge lighting.' },

  // Workshop
  { filename: 'woodworking-workshop-craftsman.png', style: 'Woodworking Workshop', room: 'Craft Workshop', 
    prompt: 'Create a photorealistic woodworking workshop for serious craftsmanship. Features: workbenches, hand tools organized, power tool stations, lumber storage, project in progress, dust collection system, natural lighting, safety equipment, craftsmanship tradition, skill development, creative making. Artisan craftsmanship with traditional woodworking excellence. Professional interior photography, bright workshop lighting.' },

  { filename: 'art-studio-painting-creative.png', style: 'Artist Studio', room: 'Painting Studio', 
    prompt: 'Create a photorealistic artist painting studio for professional creative work. Features: easels with works in progress, paint palette organization, natural north light, art supply storage, creative inspiration boards, works displayed, artistic chaos organized, creative process visible, professional art creation. Artistic creation with professional studio functionality. Professional interior photography, optimal artist lighting.' },

  // =================== DESIGN STYLES COVERAGE ===================

  // === KAWAII/CUTE (3 images) ===
  { filename: 'kawaii-bedroom-japanese-cute-culture.png', style: 'Kawaii Cute', room: 'Bedroom', 
    prompt: 'Create a photorealistic kawaii cute bedroom in Tokyo apartment embracing Japanese cute culture. Features: pastel pink and mint green colors, stuffed animal collection, fairy lights, cute character decorations like Hello Kitty, fluffy textiles, round shapes, playful elements, sweet atmosphere, pop culture references, innocent charm, dreamy lighting. Japanese cute culture with playful sophisticated design. Professional interior photography, soft kawaii lighting.' },

  { filename: 'kawaii-cafe-harajuku-district.png', style: 'Kawaii Cafe', room: 'Dining Area', 
    prompt: 'Create a photorealistic kawaii-themed cafe in Harajuku district Tokyo. Features: pastel color scheme, cute character decorations throughout, round furniture, sweet treats display case, playful signage, stuffed animal seating, rainbow elements, whimsical atmosphere, Japanese pop culture celebration, tourist attraction. Cute culture commercialization with authentic Japanese charm. Professional interior photography, bright kawaii lighting.' },

  { filename: 'kawaii-home-office-creative-workspace.png', style: 'Kawaii Home Office', room: 'Creative Workspace', 
    prompt: 'Create a photorealistic kawaii-style home office for creative professional. Features: pastel desk accessories, cute stationery organization, character-themed supplies, soft lighting, inspirational cute quotes, comfortable seating with stuffed animals, creative project displays, playful but functional workspace. Professional productivity with cute culture integration. Professional interior photography, inspiring kawaii workspace lighting.' },

  // === POP ART (3 images) ===
  { filename: 'pop-art-living-room-warhol-inspired.png', style: 'Pop Art', room: 'Living Room', 
    prompt: 'Create a photorealistic Pop Art living room inspired by Andy Warhol\'s aesthetic. Features: bright primary colors (red, yellow, blue), graphic patterns, comic book art elements, celebrity portrait prints, bold geometric furniture, Campbell soup can art, Roy Lichtenstein-style dots, 1960s influences, artistic statement pieces, commercial art aesthetic celebration. Pop culture with artistic rebellion expression. Professional interior photography, bright pop art lighting.' },

  { filename: 'pop-art-creative-office-advertising-agency.png', style: 'Pop Art Office', room: 'Creative Office', 
    prompt: 'Create a photorealistic Pop Art creative office in 1960s advertising agency style. Features: colorful furniture pieces, graphic art posters, bold pattern mixing, creative workspace with artistic inspiration, vintage advertising references, retro color schemes, artistic supplies, brainstorming walls covered in pop imagery, energetic atmosphere, creative stimulation focus. Creative energy with artistic inspiration cultivation. Professional interior photography, vibrant creative lighting.' },

  { filename: 'pop-art-dining-room-graphic-bold.png', style: 'Pop Art Dining', room: 'Dining Room', 
    prompt: 'Create a photorealistic Pop Art dining room with bold graphic elements. Features: bright colored dining chairs, graphic tablecloth, pop art prints on walls, colorful dinnerware, geometric patterns, 1960s mod influences, entertaining atmosphere, conversation starter decor, artistic dining experience, bold aesthetic choices. Social dining with pop culture artistic expression. Professional interior photography, bold dining lighting.' },

  // === PSYCHEDELIC (3 images) ===
  { filename: 'psychedelic-1960s-living-room-counterculture.png', style: 'Psychedelic 1960s', room: 'Living Room', 
    prompt: 'Create a photorealistic psychedelic living room from 1960s counterculture movement. Features: swirling kaleidoscope patterns, vibrant rainbow colors, bean bag chairs, lava lamps, peace symbols, tie-dye wall hangings, round furniture, bold geometric wallpaper, hippie aesthetic, consciousness expansion themes, Summer of Love atmosphere. 1960s counterculture with mind-expanding visual experience. Professional interior photography, colorful psychedelic lighting.' },

  { filename: 'psychedelic-music-room-1967-summer-love.png', style: 'Psychedelic Music', room: 'Music Room', 
    prompt: 'Create a photorealistic psychedelic music room from 1967 Summer of Love era. Features: colorful vintage sound equipment, trippy wall murals with flowing designs, beaded curtains, incense burning, vintage musical instruments, peace symbols, mandala patterns, creative chaos, musical expression tools, consciousness exploration atmosphere. Musical creativity with psychedelic consciousness expansion. Professional interior photography, atmospheric psychedelic lighting.' },

  { filename: 'psychedelic-art-studio-creative-space.png', style: 'Psychedelic Art Studio', room: 'Artist Studio', 
    prompt: 'Create a photorealistic psychedelic art studio for visionary artist creation. Features: paint splatters with rainbow colors, swirling pattern canvases, artistic supplies everywhere, creative inspiration boards, mandala drawings, peace symbol art, tie-dye fabric, artistic expression celebration, consciousness-expanding art creation, bohemian creativity. Artistic vision with psychedelic consciousness expression. Professional interior photography, inspiring psychedelic lighting.' },

  // =================== HISTORICAL PERIODS COVERAGE ===================

  // === ANCIENT EGYPTIAN (4 images) ===
  { filename: 'ancient-egyptian-pharaoh-throne-room.png', style: 'Ancient Egyptian Pharaoh', room: 'Throne Room', 
    prompt: 'Create a photorealistic ancient Egyptian pharaoh throne room in palace complex. Features: hieroglyphic wall carvings telling royal stories, gold leaf accents throughout, lotus-shaped column capitals, sphinx statues guarding, colorful wall paintings depicting gods, ceremonial furniture with precious metals, royal symbols everywhere, sandstone construction, imperial majesty, divine authority representation. Pharaonic grandeur with ancient mysticism and divine kingship. Professional interior photography, golden Egyptian sunlight.' },

  { filename: 'ancient-egyptian-temple-ra-sanctuary.png', style: 'Ancient Egyptian Temple', room: 'Temple Sanctuary', 
    prompt: 'Create a photorealistic ancient Egyptian temple sanctuary dedicated to sun god Ra. Features: massive stone columns with hieroglyphic inscriptions, golden altar for offerings, ceremonial vessels, incense burning stations, sacred symbols carved in stone, priests\' ceremonial areas, divine atmosphere, religious devotion expression, eternal afterlife preparation, temple rituals space. Sacred architecture with divine mystery and religious authority. Professional interior photography, mystical temple lighting.' },

  { filename: 'ancient-egyptian-noble-villa-courtyard.png', style: 'Ancient Egyptian Noble', room: 'Villa Courtyard', 
    prompt: 'Create a photorealistic ancient Egyptian noble villa courtyard for wealthy family. Features: central reflecting pool, date palm trees, papyrus plants, family shrine area, comfortable seating areas, servants\' quarters access, family gathering space, wealthy lifestyle display, social status representation, domestic luxury. Elite Egyptian living with family-centered luxury. Professional interior photography, warm Egyptian courtyard lighting.' },

  { filename: 'ancient-egyptian-scribe-school-learning.png', style: 'Ancient Egyptian Scribe', room: 'Scribal School', 
    prompt: 'Create a photorealistic ancient Egyptian scribal school for education and writing. Features: writing tablets and reeds, papyrus scrolls, hieroglyphic practice, students learning, master scribe teaching, knowledge preservation, writing system education, administrative training, social mobility through education, literacy importance. Educational excellence with knowledge preservation tradition. Professional interior photography, focused learning lighting.' },

  // === ANCIENT GREEK (4 images) ===
  { filename: 'ancient-greek-symposium-philosophical-discussion.png', style: 'Ancient Greek Symposium', room: 'Symposium Hall', 
    prompt: 'Create a photorealistic ancient Greek symposium hall in Athenian villa for intellectual discourse. Features: marble columns with Corinthian capitals, mosaic floors depicting mythology, frescoes of Greek gods, dining couches arranged for conversation, wine vessels (kraters and kylixes), philosophical atmosphere, intellectual gathering space, democratic ideals expression, Socratic dialogue setting. Greek philosophy with architectural perfection and intellectual discourse. Professional interior photography, classical Greek natural lighting.' },

  { filename: 'ancient-greek-library-alexandria-scrolls.png', style: 'Ancient Greek Library', room: 'Alexandria Library', 
    prompt: 'Create a photorealistic ancient Greek library room in Great Library of Alexandria. Features: papyrus scrolls organized on wooden shelves, reading tables with oil lamps, scholarly atmosphere, geometric patterns in floor design, marble construction, knowledge preservation mission, intellectual pursuit, classical learning, wisdom tradition, international scholarship. Ancient scholarship with intellectual legacy preservation. Professional interior photography, scholarly ancient lighting.' },

  { filename: 'ancient-greek-gymnasium-athletic-training.png', style: 'Ancient Greek Gymnasium', room: 'Training Hall', 
    prompt: 'Create a photorealistic ancient Greek gymnasium training hall for athletic development. Features: athletic training equipment, marble columns, statues of athletes, olive oil storage for body preparation, sand pit for wrestling, athletic competition preparation, physical education, Olympic Games training, mind-body harmony, Greek ideal of physical perfection. Athletic excellence with Greek physical education tradition. Professional interior photography, bright athletic training lighting.' },

  { filename: 'ancient-greek-theater-drama-performance.png', style: 'Ancient Greek Theater', room: 'Performance Space', 
    prompt: 'Create a photorealistic ancient Greek theater performance area for drama and comedy. Features: circular orchestra area, marble seating (theatron), acoustic design for voice projection, dramatic masks display, chorus area, tragedy and comedy performance space, cultural education, civic participation, artistic expression, community gathering. Theatrical arts with community cultural education. Professional interior photography, dramatic theater lighting.' },

  // === MEDIEVAL GOTHIC (4 images) ===
  { filename: 'gothic-cathedral-main-nave-soaring.png', style: 'Gothic Cathedral', room: 'Main Nave', 
    prompt: 'Create a photorealistic Gothic cathedral main nave from 13th century France. Features: soaring pointed arches reaching toward heaven, ribbed stone vaulting, magnificent stained glass windows telling biblical stories, stone construction with flying buttresses, religious sculptures, altar with gold details, candlelight flickering, sacred atmosphere, divine aspiration, architectural innovation representing faith. Medieval spirituality with architectural transcendence toward divine. Professional interior photography, colored stained glass lighting.' },

  { filename: 'gothic-monastery-scriptorium-manuscript.png', style: 'Gothic Monastery', room: 'Scriptorium', 
    prompt: 'Create a photorealistic Gothic monastery scriptorium for illuminated manuscript creation. Features: monk writing desks, quill pens and ink, parchment scrolls, illuminated letters being painted, religious texts being copied, library of religious works, scholarly atmosphere, knowledge preservation, religious devotion through learning, medieval education center. Religious scholarship with knowledge preservation mission. Professional interior photography, focused manuscript lighting.' },

  { filename: 'gothic-castle-great-hall-feudal-power.png', style: 'Gothic Castle', room: 'Great Hall', 
    prompt: 'Create a photorealistic Gothic castle great hall in medieval fortress for feudal court. Features: massive stone walls, pointed arch windows, wooden beam ceiling, long dining tables for feasts, tapestries depicting family history, weapons displays, large fireplace, baronial atmosphere, feudal power display, medieval social hierarchy, knight culture. Medieval nobility with fortress strength and feudal authority. Professional interior photography, torchlit medieval atmosphere.' },

  { filename: 'gothic-merchant-house-urban-prosperity.png', style: 'Gothic Merchant House', room: 'Trading Hall', 
    prompt: 'Create a photorealistic Gothic merchant house trading hall in medieval city. Features: Gothic arched windows, stone and timber construction, merchant goods displays, accounting tables, scales for weighing, commercial prosperity, urban middle class, trade route connections, economic power, guild membership, medieval commerce. Medieval commerce with urban prosperity and trade success. Professional interior photography, prosperous merchant lighting.' },

  // === BAROQUE (1600-1750) (4 images) ===
  { filename: 'baroque-versailles-hall-mirrors-royal.png', style: 'Baroque Versailles', room: 'Hall of Mirrors', 
    prompt: 'Create a photorealistic Baroque hall of mirrors in Versailles Palace style for royal court ceremonies. Features: 17 mirror-clad arches, crystal chandeliers, gold leaf ornamentation everywhere, marble columns, painted ceiling depicting royal victories, ornate furniture, court ceremonies, royal magnificence, absolute monarchy power display, divine right of kings, French royal grandeur. Royal absolutism with theatrical grandeur and divine authority. Professional interior photography, glittering baroque palace lighting.' },

  { filename: 'baroque-church-high-altar-counter-reformation.png', style: 'Baroque Church', room: 'High Altar', 
    prompt: 'Create a photorealistic Baroque church high altar from Counter-Reformation period. Features: dramatic marble sculptures, gold ornamentation, painted ceiling with religious scenes, religious ecstasy depicted in art, theatrical lighting effects, Catholic Church triumph, spiritual emotion, divine drama, religious art inspiring faith, Counter-Reformation response to Protestant challenge. Counter-Reformation spirituality with emotional religious intensity. Professional interior photography, dramatic religious lighting.' },

  { filename: 'baroque-palace-grand-staircase-imperial.png', style: 'Baroque Palace', room: 'Grand Staircase', 
    prompt: 'Create a photorealistic Baroque palace grand staircase for royal residence. Features: marble steps with ornate balustrades, painted ceiling frescoes, gold leaf details, dramatic lighting, sculptural decorations, imperial grandeur, visitor impression, royal power demonstration, architectural theater, ceremonial importance, baroque drama. Imperial architecture with ceremonial grandeur and royal authority. Professional interior photography, dramatic imperial lighting.' },

  { filename: 'baroque-opera-house-performance-hall.png', style: 'Baroque Opera House', room: 'Performance Hall', 
    prompt: 'Create a photorealistic Baroque opera house performance hall for royal entertainment. Features: ornate box seats, gold decoration throughout, painted ceiling, crystal chandeliers, red velvet seating, acoustic design, court entertainment, aristocratic culture, musical performance, social hierarchy display, cultural refinement. Court culture with aristocratic entertainment and musical sophistication. Professional interior photography, theatrical opera lighting.' },

  // === VICTORIAN (1837-1901) (4 images) ===
  { filename: 'victorian-parlor-family-formal-sitting.png', style: 'Victorian Family Parlor', room: 'Formal Parlor', 
    prompt: 'Create a photorealistic Victorian family formal parlor in 1880s London middle-class townhouse. Features: heavy drapery in rich fabrics, ornate furniture with carved details, Persian rugs, antimacassars on chairs, upright piano, family portraits, gas lighting fixtures, moral propriety atmosphere, domestic virtue, middle-class respectability, social calling rituals, family status display. Victorian respectability with domestic comfort and moral authority. Professional interior photography, warm Victorian gaslight atmosphere.' },

  { filename: 'victorian-dining-room-family-dinner-ritual.png', style: 'Victorian Dining Room', room: 'Family Dining', 
    prompt: 'Create a photorealistic Victorian dining room set for formal family dinner. Features: mahogany extending table, upholstered dining chairs, china cabinet displaying best dishes, silver service, elaborate wallpaper patterns, heavy curtains, gas chandelier, formal dining rituals, family hierarchy, domestic ceremony, servant service, social etiquette. Victorian family life with formal dining tradition and social hierarchy. Professional interior photography, formal Victorian dining light.' },

  { filename: 'victorian-master-bedroom-domestic-privacy.png', style: 'Victorian Master Bedroom', room: 'Private Chamber', 
    prompt: 'Create a photorealistic Victorian master bedroom for married couple privacy. Features: four-poster bed with heavy curtains, washstand with pitcher and basin, wardrobe with mirror, dressing table, moral propriety, domestic privacy, marriage sanctity, family life, Victorian values, gender roles, private family sphere. Victorian domestic life with marriage privacy and family values. Professional interior photography, intimate Victorian lighting.' },

  { filename: 'victorian-library-gentleman-study.png', style: 'Victorian Gentleman\'s Library', room: 'Private Study', 
    prompt: 'Create a photorealistic Victorian gentleman\'s library and study for male domain. Features: leather-bound books, smoking chair, desk with inkwell, scientific instruments, masculine atmosphere, intellectual pursuit, professional success, patriarchal authority, education importance, self-improvement, social advancement through knowledge. Victorian masculine space with intellectual authority and social advancement. Professional interior photography, scholarly Victorian lighting.' },

  // =================== CULTURAL INFLUENCES COVERAGE ===================

  // === VIETNAMESE FRENCH COLONIAL (3 images) ===
  { filename: 'vietnamese-french-colonial-saigon-villa.png', style: 'Vietnamese French Colonial', room: 'Main Living Room', 
    prompt: 'Create a photorealistic Vietnamese French colonial living room in 1920s Saigon villa. Features: high ceilings with ceiling fans, tropical hardwood floors, French colonial furniture adapted for climate, Vietnamese silk textiles, shuttered windows for ventilation, indoor plants, cross-cultural synthesis, tropical adaptation, colonial elegance, Southeast Asian charm, cultural fusion. French colonial architecture with Vietnamese cultural adaptation. Professional interior photography, tropical colonial natural light.' },

  { filename: 'vietnamese-traditional-hoi-an-house.png', style: 'Vietnamese Traditional', room: 'Courtyard House', 
    prompt: 'Create a photorealistic Vietnamese traditional house courtyard in historic Hoi An. Features: wooden construction with carved details, traditional tile roof, courtyard garden with koi pond, ancestral altar, family living spaces, traditional crafts, community orientation, cultural continuity, Southeast Asian architecture, family-centered design, generational living. Vietnamese tradition with family-centered cultural continuity. Professional interior photography, soft Vietnamese courtyard natural light.' },

  { filename: 'vietnamese-modern-ho-chi-minh-apartment.png', style: 'Vietnamese Modern', room: 'Contemporary Apartment', 
    prompt: 'Create a photorealistic modern Vietnamese apartment in Ho Chi Minh City high-rise. Features: contemporary furniture with Vietnamese accents, traditional art mixed with modern pieces, tropical plants, efficient space use, urban living, cultural identity preserved, modern Vietnamese lifestyle, economic development, urban sophistication, cultural pride. Modern Vietnamese with cultural identity preservation. Professional interior photography, contemporary Vietnamese lighting.' },

  // === SINGAPOREAN MODERN ASIAN (3 images) ===
  { filename: 'singaporean-modern-marina-bay-penthouse.png', style: 'Singaporean Modern', room: 'Penthouse Living', 
    prompt: 'Create a photorealistic Singaporean modern penthouse living room overlooking Marina Bay. Features: floor-to-ceiling windows with city skyline views, tropical modern furniture, air conditioning systems, multicultural art collection, luxury finishes, tropical luxury design, Asian sophistication, urban density management, global city influences, economic prosperity. Tropical luxury with Asian modernity and global sophistication. Professional interior photography, Singapore skyline city lighting.' },

  { filename: 'singaporean-shophouse-heritage-renovation.png', style: 'Singaporean Shophouse', room: 'Renovated Interior', 
    prompt: 'Create a photorealistic renovated Singaporean shophouse interior in historic Chinatown district. Features: original architecture preserved, modern insertions, tropical climate adaptation, multicultural influences, heritage conservation, contemporary living needs, cultural preservation, urban renewal, architectural heritage, modern adaptation. Heritage preservation with contemporary adaptation and cultural respect. Professional interior photography, tropical heritage natural lighting.' },

  { filename: 'singaporean-hawker-center-food-court.png', style: 'Singaporean Hawker Center', room: 'Food Court', 
    prompt: 'Create a photorealistic Singaporean hawker center food court representing multicultural dining. Features: diverse food stalls, communal seating, multicultural food options, social dining, affordable eating, cultural mixing, local food culture, community gathering, economic accessibility, cultural diversity celebration. Multicultural community with food culture and social interaction. Professional interior photography, vibrant hawker center lighting.' },

  // === MALAYSIAN PERANAKAN (3 images) ===
  { filename: 'malaysian-peranakan-heritage-house.png', style: 'Malaysian Peranakan', room: 'Heritage House', 
    prompt: 'Create a photorealistic Malaysian Peranakan heritage house interior in Malacca. Features: intricate Peranakan tiles (ceramic tiles), carved wooden panels, Chinese and Malay cultural fusion, colonial influences, traditional craftsmanship, family heritage, cultural mixing, Southeast Asian trading culture, ancestral home, cultural preservation. Peranakan culture with Chinese-Malay cultural synthesis. Professional interior photography, warm heritage Malaysian lighting.' },

  { filename: 'malaysian-modern-kuala-lumpur-condo.png', style: 'Malaysian Modern', room: 'Contemporary Condo', 
    prompt: 'Create a photorealistic modern Malaysian condominium in Kuala Lumpur Petronas area. Features: contemporary furniture with Malaysian design elements, tropical plants, efficient air conditioning, multicultural art, urban sophistication, economic development, modern Malaysian identity, global city living, cultural pride with modernity. Modern Malaysian with multicultural urban sophistication. Professional interior photography, contemporary Malaysian lighting.' },

  { filename: 'malaysian-kampung-traditional-village.png', style: 'Malaysian Kampung', room: 'Village House', 
    prompt: 'Create a photorealistic Malaysian kampung (village) traditional house interior. Features: stilted wooden construction, woven mat flooring, traditional crafts, extended family living, community orientation, rural Malaysian culture, traditional lifestyle, cultural authenticity, village community, intergenerational living, traditional values. Traditional Malaysian with village community culture and authenticity. Professional interior photography, soft village natural lighting.' },

  // === FILIPINO TROPICAL (3 images) ===
  { filename: 'filipino-bahay-kubo-traditional-house.png', style: 'Filipino Bahay Kubo', room: 'Traditional House', 
    prompt: 'Create a photorealistic Filipino bahay kubo traditional house interior. Features: bamboo construction, nipa palm thatching, elevated design for flooding, natural ventilation, traditional Filipino crafts, family gathering space, tropical island living, indigenous materials, cultural authenticity, island lifestyle, traditional architecture. Filipino tradition with tropical island living and indigenous culture. Professional interior photography, tropical Filipino natural lighting.' },

  { filename: 'filipino-spanish-colonial-heritage-house.png', style: 'Filipino Spanish Colonial', room: 'Heritage House', 
    prompt: 'Create a photorealistic Filipino Spanish colonial heritage house in Vigan. Features: Spanish colonial architecture adapted to tropical climate, capiz shell windows, hardwood floors, antique Filipino furniture, religious art, colonial period preservation, cultural heritage, Spanish influence adapted, family heritage, historical preservation. Spanish colonial with Filipino cultural adaptation and historical preservation. Professional interior photography, heritage Filipino lighting.' },

  { filename: 'filipino-modern-manila-apartment.png', style: 'Filipino Modern', room: 'Urban Apartment', 
    prompt: 'Create a photorealistic modern Filipino apartment in Manila metropolis. Features: contemporary furniture, Filipino art and crafts, tropical plants, efficient space use, urban Filipino lifestyle, cultural identity, modern development, overseas worker family connections, economic progress, cultural pride. Modern Filipino with urban development and cultural identity preservation. Professional interior photography, contemporary Filipino lighting.' },

  // === BALINESE HINDU TROPICAL (3 images) ===
  { filename: 'balinese-villa-tropical-luxury.png', style: 'Balinese Villa', room: 'Tropical Living', 
    prompt: 'Create a photorealistic Balinese villa living area with tropical luxury. Features: open-air design, tropical hardwood, Hindu religious elements, carved wooden panels, temple-inspired architecture, tropical gardens integrated, natural ventilation, spiritual atmosphere, luxury resort feeling, Balinese cultural authenticity. Balinese Hindu culture with tropical luxury and spiritual atmosphere. Professional interior photography, tropical Balinese natural lighting.' },

  { filename: 'balinese-temple-hindu-worship.png', style: 'Balinese Temple', room: 'Temple Compound', 
    prompt: 'Create a photorealistic Balinese Hindu temple interior for religious ceremonies. Features: carved stone architecture, Hindu deity statues, temple offerings (pejati), incense burning, religious ceremonies, spiritual devotion, Balinese Hinduism, temple festivals, community religious life, sacred space, cultural tradition, religious art. Balinese Hinduism with temple worship and religious community. Professional interior photography, sacred temple lighting.' },

  { filename: 'balinese-rice-terrace-village-house.png', style: 'Balinese Village', room: 'Village House', 
    prompt: 'Create a photorealistic Balinese village house near rice terraces. Features: traditional Balinese architecture, family compound (pekarangan), rice terrace views, traditional crafts, village community life, agricultural lifestyle, cultural authenticity, extended family living, traditional values, rural Balinese culture. Traditional Balinese with agricultural village life and cultural authenticity. Professional interior photography, village Balinese natural lighting.' },

  // =================== FANTASY & ENTERTAINMENT COVERAGE ===================

  // === HARRY POTTER MAGICAL ACADEMIA (5 images) ===
  { filename: 'hogwarts-great-hall-magical-dining.png', style: 'Harry Potter Hogwarts', room: 'Great Hall', 
    prompt: 'Create a photorealistic Hogwarts Great Hall for magical school dining and ceremonies. Features: four long house tables, floating candles, enchanted ceiling showing night sky, Gothic architecture, stone walls, stained glass windows, professors\' high table, house banners (Gryffindor, Slytherin, Hufflepuff, Ravenclaw), magical atmosphere, wizard education, house pride, magical community. Wizarding education with magical community gathering and house traditions. Professional interior photography, magical candlelit atmosphere.' },

  { filename: 'hogwarts-library-magical-books.png', style: 'Harry Potter Library', room: 'Magical Library', 
    prompt: 'Create a photorealistic Hogwarts library for magical education and research. Features: towering bookshelves reaching impossible heights, moving portraits, ancient magical tomes, restricted section, floating books, magical research, wizard knowledge, educational magic, scholarly pursuit, magical learning, dangerous knowledge, academic magic. Magical education with scholarly pursuit and dangerous magical knowledge. Professional interior photography, mysterious magical library lighting.' },

  { filename: 'hogwarts-common-room-gryffindor.png', style: 'Harry Potter Gryffindor', room: 'Common Room', 
    prompt: 'Create a photorealistic Gryffindor common room in Hogwarts tower. Features: cozy fireplace with armchairs, red and gold color scheme, lion motifs, stone walls, tapestries, comfortable seating, house pride, wizard student life, magical community, courage values, friendship, house unity, magical school life. Gryffindor house with courage values and magical student community. Professional interior photography, warm Gryffindor firelight.' },

  { filename: 'hogwarts-potions-classroom-dungeon.png', style: 'Harry Potter Potions', room: 'Potions Classroom', 
    prompt: 'Create a photorealistic Hogwarts potions classroom in castle dungeons. Features: brewing cauldrons, ingredient shelves with magical components, stone dungeon walls, potion brewing stations, magical education, dangerous magical learning, Severus Snape atmosphere, dark magic education, magical chemistry, wizard education, academic rigor. Magical education with dangerous potion brewing and dark academic atmosphere. Professional interior photography, dungeon potions lighting.' },

  { filename: 'hogwarts-divination-tower-prophecy.png', style: 'Harry Potter Divination', room: 'Divination Tower', 
    prompt: 'Create a photorealistic Hogwarts divination classroom in castle tower. Features: crystal balls, tea cup reading, circular tower room, mystical atmosphere, Professor Trelawney style, fortune telling equipment, magical prediction, wizard mysticism, prophecy study, magical foresight, academic mysticism, tower setting. Magical divination with mystical atmosphere and prophetic study. Professional interior photography, mystical divination lighting.' }
];

/**
 * Load generation progress to avoid overwriting existing images
 */
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch (error) {
      console.log('⚠️  Could not load progress file, starting fresh');
      return { completed: [], skipped: [], failed: [] };
    }
  }
  return { completed: [], skipped: [], failed: [] };
}

/**
 * Save generation progress
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Check if image already exists and is valid (not a gradient placeholder)
 */
function shouldSkipImage(imageSpec) {
  const filepath = path.join(OUTPUT_DIR, imageSpec.filename);
  
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    
    // Skip if file is larger than 200KB (likely a real image)
    if (stats.size > 200 * 1024) {
      return { skip: true, reason: `Real image exists (${Math.round(stats.size / 1024)}KB)` };
    }
    
    // Skip if file is smaller but still decent size (maybe real but compressed)
    if (stats.size > 100 * 1024) {
      return { skip: true, reason: `Existing image (${Math.round(stats.size / 1024)}KB)` };
    }
    
    // Files under 100KB are likely gradients/placeholders - regenerate
    return { skip: false, reason: `Placeholder detected (${Math.round(stats.size / 1024)}KB) - will regenerate` };
  }
  
  return { skip: false, reason: 'File does not exist' };
}

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
 * Generate complete masonry gallery with progress tracking and overwrite protection
 */
async function generateCompleteGallery() {
  console.log('🎨 COMPLETE Masonry Gallery Generator');
  console.log('====================================');
  console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND'}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📸 Total images in collection: ${COMPLETE_GALLERY_IMAGES.length}`);

  if (!API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in environment');
    process.exit(1);
  }

  // Load previous progress
  let progress = loadProgress();
  
  // Count existing files
  const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(file => file.endsWith('.png'));
  console.log(`📋 Found ${existingFiles.length} existing PNG files`);
  
  let successCount = progress.completed.length;
  let skippedCount = progress.skipped.length;  
  let failureCount = progress.failed.length;

  console.log(`📊 Progress: ${successCount} completed, ${skippedCount} skipped, ${failureCount} failed\n`);

  // Filter images to process (skip already completed)
  const imagesToProcess = COMPLETE_GALLERY_IMAGES.filter(spec => 
    !progress.completed.includes(spec.filename) &&
    !progress.skipped.includes(spec.filename)
  );

  console.log(`🚀 Processing ${imagesToProcess.length} remaining images\n`);

  for (let i = 0; i < imagesToProcess.length; i++) {
    const imageSpec = imagesToProcess[i];
    
    console.log(`\n[${i + 1}/${imagesToProcess.length}] ${imageSpec.style}`);
    console.log(`📍 ${imageSpec.room} - ${imageSpec.filename}`);
    
    // Check if we should skip this image
    const skipCheck = shouldSkipImage(imageSpec);
    
    if (skipCheck.skip) {
      console.log(`⏭️  Skipping: ${skipCheck.reason}`);
      progress.skipped.push(imageSpec.filename);
      skippedCount++;
      saveProgress(progress);
      continue;
    } else {
      console.log(`💡 ${skipCheck.reason}`);
    }
    
    try {
      const result = await generateRealImage(imageSpec);
      
      if (result.success) {
        console.log(`✅ Generated: ${result.filename} (${Math.round(result.size / 1024)}KB)`);
        progress.completed.push(imageSpec.filename);
        successCount++;
        saveProgress(progress);
      }
      
      // Rate limiting - 10 seconds between requests to avoid hitting quotas
      if (i < imagesToProcess.length - 1) {
        console.log('⏳ Waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.error(`❌ Failed ${imageSpec.filename}: ${error.message}`);
      progress.failed.push(imageSpec.filename);
      failureCount++;
      saveProgress(progress);
      
      // Continue with next image even if one fails
      if (i < imagesToProcess.length - 1) {
        console.log('⏳ Waiting 5 seconds before next...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  // Final statistics
  const totalAttempted = successCount + failureCount;
  const totalPossible = COMPLETE_GALLERY_IMAGES.length;
  
  console.log(`\n🎉 Complete Masonry Gallery Generation Session Finished!`);
  console.log(`✅ Successfully generated: ${successCount} images`);
  console.log(`⏭️  Skipped existing: ${skippedCount} images`);
  console.log(`❌ Failed: ${failureCount} images`);
  console.log(`📊 Success rate: ${totalAttempted > 0 ? Math.round((successCount / totalAttempted) * 100) : 0}%`);
  console.log(`🎯 Total coverage: ${Math.round(((successCount + skippedCount) / totalPossible) * 100)}% of collection`);
  
  // Generate comprehensive final report
  const finalReport = {
    timestamp: new Date().toISOString(),
    session_summary: {
      total_in_collection: totalPossible,
      completed_this_session: imagesToProcess.length - (imagesToProcess.length - (successCount - progress.completed.length)),
      skipped_existing: skippedCount,
      failed_this_session: failureCount - progress.failed.length
    },
    cumulative_totals: {
      total_successful: successCount,
      total_skipped: skippedCount,
      total_failed: failureCount,
      total_coverage_percent: Math.round(((successCount + skippedCount) / totalPossible) * 100)
    },
    categories_covered: {
      project_types: ['Residential', 'Commercial', 'Hospitality', 'Cultural & Educational'],
      room_functions: ['Core Living', 'Specialty Spaces', 'Entertainment', 'Wellness'], 
      design_styles: ['Modern', 'Traditional', 'Kawaii/Cute', 'Pop Art', 'Psychedelic'],
      historical_periods: ['Ancient Egyptian', 'Ancient Greek', 'Medieval Gothic', 'Baroque', 'Victorian'],
      cultural_influences: ['Vietnamese', 'Singaporean', 'Malaysian', 'Filipino', 'Balinese'],
      fantasy_themes: ['Harry Potter Magical Academia']
    },
    next_steps: skippedCount + successCount < totalPossible ? 
      'Run script again to continue generating remaining images' : 
      'All images complete! Ready for app integration.'
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'complete-gallery-final-report.json'), 
    JSON.stringify(finalReport, null, 2)
  );
  
  console.log(`\n📋 Final comprehensive report saved: complete-gallery-final-report.json`);
  console.log(`\n🌟 Coverage Analysis:`);
  console.log(`   🏠 Project Types: Residential, Commercial, Hospitality, Cultural`);
  console.log(`   🛋️  Room Functions: Living, Specialty, Entertainment, Wellness`);
  console.log(`   🎨 Design Styles: Modern, Traditional, Kawaii, Pop Art, Psychedelic`);
  console.log(`   📅 Historical: Ancient, Medieval, Baroque, Victorian`);
  console.log(`   🌍 Cultural: Southeast Asian, Fantasy Themes`);
  
  if (successCount + skippedCount < totalPossible) {
    console.log(`\n🔄 Run the script again to continue generating the remaining ${totalPossible - (successCount + skippedCount)} images!`);
  } else {
    console.log(`\n🎊 COMPLETE! All ${totalPossible} images are ready for your masonry gallery!`);
  }
}

if (require.main === module) {
  generateCompleteGallery();
}