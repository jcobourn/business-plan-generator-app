class BusinessPlanGenerator {
    constructor() {
        this.userLocation = '';
        this.userBusiness = '';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const businessInput = document.getElementById('businessInput');
        const locationInput = document.getElementById('locationInput');
        const generatePlanBtn = document.getElementById('generatePlan');
        const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
        const suggestBusinessBtn = document.getElementById('suggestBusiness');
        const startOverBtn = document.getElementById('startOver');

        // Form validation
        businessInput.addEventListener('input', () => this.checkFormCompletion());
        locationInput.addEventListener('input', () => this.checkFormCompletion());

        // Button event listeners
        generatePlanBtn.addEventListener('click', () => {
            console.log('Start My Business button clicked');
            this.generateBusinessPlan();
        });
        useCurrentLocationBtn.addEventListener('click', () => this.useCurrentLocation());
        suggestBusinessBtn.addEventListener('click', () => this.suggestBusinessBasedOnLocation());
        startOverBtn.addEventListener('click', () => this.startOver());

        // Initial form check
        this.checkFormCompletion();
    }

    checkFormCompletion() {
        const businessInput = document.getElementById('businessInput');
        const locationInput = document.getElementById('locationInput');
        const generatePlanBtn = document.getElementById('generatePlan');

        const hasBusiness = businessInput.value.trim();
        const hasLocation = locationInput.value.trim();

        const shouldEnable = hasBusiness && hasLocation;
        generatePlanBtn.disabled = !shouldEnable;
        
        console.log('Form validation:', { hasBusiness, hasLocation, shouldEnable, buttonDisabled: generatePlanBtn.disabled });
    }

    async useCurrentLocation() {
        const locationInput = document.getElementById('locationInput');
        const useCurrentLocationBtn = document.getElementById('useCurrentLocation');

        if (navigator.geolocation) {
            useCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
            useCurrentLocationBtn.disabled = true;

            try {
                const position = await this.getCurrentPosition();
                const { latitude, longitude } = position.coords;
                
                // Use BigDataCloud API for reverse geocoding
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();
                
                const location = `${data.city || data.locality}, ${data.principalSubdivision || data.countryName}`;
                locationInput.value = location;
                this.checkFormCompletion();
                
            } catch (error) {
                console.error('Error getting location:', error);
                alert('Unable to get your current location. Please enter it manually.');
            } finally {
                useCurrentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
                useCurrentLocationBtn.disabled = false;
            }
        } else {
            alert('Geolocation is not supported by this browser. Please enter your location manually.');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    }

    async suggestBusinessBasedOnLocation() {
        const locationInput = document.getElementById('locationInput');
        const businessInput = document.getElementById('businessInput');
        const suggestBusinessBtn = document.getElementById('suggestBusiness');
        const location = locationInput.value.trim().toLowerCase();

        if (!location) {
            alert('Please enter a location first to get business suggestions.');
            return;
        }

        // Show loading state
        suggestBusinessBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
        suggestBusinessBtn.classList.add('btn-suggest-active');
        suggestBusinessBtn.disabled = true;

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1500));

        const suggestion = this.generateLocationBasedSuggestion(location);
        businessInput.value = suggestion;
        this.checkFormCompletion();

        // Highlight the input field to show suggestion was made
        businessInput.classList.add('input-suggested');
        businessInput.style.borderColor = '#059669';
        businessInput.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';

        // Show success state
        suggestBusinessBtn.innerHTML = '<i class="fas fa-check"></i> Suggested!';
        suggestBusinessBtn.classList.remove('btn-suggest-active');
        suggestBusinessBtn.classList.add('btn-suggest-success');
        suggestBusinessBtn.disabled = false;

        // Reset button and input styling after 3 seconds
        setTimeout(() => {
            suggestBusinessBtn.innerHTML = '<i class="fas fa-lightbulb"></i> You tell me';
            suggestBusinessBtn.classList.remove('btn-suggest-success');
            businessInput.classList.remove('input-suggested');
            businessInput.style.borderColor = '';
            businessInput.style.boxShadow = '';
        }, 3000);
    }

    generateLocationBasedSuggestion(location) {
        const suggestions = {
            'university': ['Student Tutoring Service', 'Campus Food Delivery', 'Student Housing Services', 'Campus Tech Support', 'Student Fitness Coaching'],
            'college': ['Student Tutoring Service', 'Campus Food Delivery', 'Student Housing Services', 'Campus Tech Support', 'Student Fitness Coaching'],
            'beach': ['Beach Equipment Rental', 'Surf Lessons', 'Beach Photography', 'Beach Food Truck', 'Water Sports Equipment'],
            'downtown': ['Coffee Shop', 'Food Truck', 'Personal Training', 'Web Design Agency', 'Pet Grooming'],
            'tech': ['Web Development Agency', 'IT Consulting', 'Digital Marketing', 'Tech Support', 'Software Training'],
            'family': ['Child Care Services', 'Pet Grooming', 'House Cleaning', 'Personal Training', 'Tutoring Services'],
            'tourist': ['Tour Guide Services', 'Souvenir Shop', 'Local Food Tours', 'Photography Services', 'Transportation Services'],
            'suburban': ['Lawn Care Services', 'House Cleaning', 'Pet Sitting', 'Personal Training', 'Home Maintenance']
        };

        for (const [keyword, businessList] of Object.entries(suggestions)) {
            if (location.includes(keyword)) {
                return this.getRandomSuggestion(businessList);
            }
        }

        // Default suggestions for any location
        const defaultSuggestions = ['Coffee Shop', 'Food Truck', 'Personal Training', 'Web Design Agency', 'Pet Grooming', 'House Cleaning', 'Tutoring Services'];
        return this.getRandomSuggestion(defaultSuggestions);
    }

    getRandomSuggestion(suggestions) {
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    async generateBusinessPlan() {
        try {
            const businessInput = document.getElementById('businessInput');
            const locationInput = document.getElementById('locationInput');

            const business = businessInput.value.trim();
            const location = locationInput.value.trim();

            if (!business || !location) {
                alert('Please fill in all fields!');
                return;
            }

            this.userBusiness = business;
            this.userLocation = location;

            // Show loading
            document.getElementById('businessSection').style.display = 'none';
            document.getElementById('loadingSection').style.display = 'block';

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate business plan
            const businessPlanData = this.generateBusinessPlanData(business, location);
            
            if (!businessPlanData) {
                throw new Error('Failed to generate business plan data');
            }

            // Display business plan
            this.displayBusinessPlan(businessPlanData);

            // Hide loading, show plan
            document.getElementById('loadingSection').style.display = 'none';
            document.getElementById('planSection').style.display = 'block';
            
        } catch (error) {
            console.error('Error generating business plan:', error);
            alert('Sorry, there was an error generating your business plan. Please try again.');
            
            // Hide loading, show business section again
            document.getElementById('loadingSection').style.display = 'none';
            document.getElementById('businessSection').style.display = 'block';
        }
    }

    generateBusinessPlanData(business, location) {
        const businessType = business.toLowerCase();
        const specificBusiness = business;
        const businessPlan = this.generateSpecificBusinessPlan(specificBusiness, businessType);

        // Add dynamic resources to each step
        const startupStepsWithResources = businessPlan.startupSteps.map((step, index) => ({
            ...step,
            resources: this.generateStepResources(businessType, index + 1, step.title)
        }));

        // Generate alternative business suggestion
        const alternativeSuggestion = this.generateAlternativeSuggestion(businessType, location);

        // Generate 3 business name recommendations
        const businessNames = this.generateBusinessNameRecommendations(businessType, location);
        console.log('Generated business names:', businessNames);
        
        // Fallback business names if generation fails
        let finalBusinessNames = businessNames;
        if (!businessNames || businessNames.length === 0) {
            finalBusinessNames = [
                `${business} ${location} Co.`,
                `${business} ${location} LLC`,
                `${business} ${location} & Co.`
            ];
            console.log('Using fallback business names:', finalBusinessNames);
        }

        return {
            business: specificBusiness,
            location: location,
            alternativeSuggestion: alternativeSuggestion,
            businessNames: finalBusinessNames,
            overview: businessPlan.overview,
            targetMarket: businessPlan.targetMarket,
            revenueStreams: businessPlan.revenueStreams,
            pricing: businessPlan.pricing,
            revenueProjection: businessPlan.revenueProjection,
            startupSteps: startupStepsWithResources,
            marketingStrategies: businessPlan.marketingStrategies,
            challenges: businessPlan.challenges,
            locationRationale: this.generateLocationRationale(location, businessType)
        };
    }

    generateBusinessNameRecommendations(businessType, location) {
        console.log('generateBusinessNameRecommendations called with:', businessType, location);
        const businessTypeLower = businessType.toLowerCase();
        
        // Advanced business name generator that creates truly relevant names for ANY business
        const generateDynamicBusinessName = () => {
            // Extract meaningful words from business type
            const words = businessTypeLower.split(/\s+/).filter(word => word.length > 2);
            const primaryWord = words[0] || businessTypeLower;
            const secondaryWord = words[1] || '';
            
            // Create business-specific name patterns that work for any industry
            const createBusinessName = () => {
                const patterns = [
                    // Pattern 1: [Business Type] & [Quality]
                    () => {
                        const qualities = ['Excellence', 'Elite', 'Express', 'Expert', 'Extra', 'Exclusive', 'Essential', 'Epic', 'Elegant', 'Empire'];
                        return `${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} & ${qualities[Math.floor(Math.random() * qualities.length)]}`;
                    },
                    
                    // Pattern 2: The [Business Type] [Place]
                    () => {
                        const places = ['Company', 'Collective', 'Corner', 'Crew', 'Club', 'Co.', 'Center', 'Circle', 'Craft', 'Culture'];
                        return `The ${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} ${places[Math.floor(Math.random() * places.length)]}`;
                    },
                    
                    // Pattern 3: [Action] [Business Type]
                    () => {
                        const actions = ['Go', 'Get', 'Give', 'Grow', 'Guide', 'Guard', 'Gather', 'Gain', 'Glow', 'Grace'];
                        return `${actions[Math.floor(Math.random() * actions.length)]} ${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)}`;
                    },
                    
                    // Pattern 4: [Business Type] [Action]
                    () => {
                        const actions = ['Now', 'Next', 'New', 'Nice', 'Noble', 'Natural', 'Nurture', 'Navigate', 'Network', 'Nest'];
                        return `${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} ${actions[Math.floor(Math.random() * actions.length)]}`;
                    },
                    
                    // Pattern 5: [Quality] [Business Type]
                    () => {
                        const qualities = ['Super', 'Smart', 'Swift', 'Strong', 'Sweet', 'Smooth', 'Sharp', 'Special', 'Simple', 'Solid'];
                        return `${qualities[Math.floor(Math.random() * qualities.length)]} ${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)}`;
                    },
                    
                    // Pattern 6: [Business Type] [Quality]
                    () => {
                        const qualities = ['Works', 'Wonders', 'Wins', 'Worth', 'World', 'Way', 'Wise', 'Warm', 'Wild', 'Wonderful'];
                        return `${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} ${qualities[Math.floor(Math.random() * qualities.length)]}`;
                    },
                    
                    // Pattern 7: The [Quality] [Business Type]
                    () => {
                        const qualities = ['Amazing', 'Awesome', 'Adorable', 'Ambitious', 'Artistic', 'Authentic', 'Adventurous', 'Affordable', 'Attractive', 'Amazing'];
                        return `The ${qualities[Math.floor(Math.random() * qualities.length)]} ${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)}`;
                    },
                    
                    // Pattern 8: [Business Type] & [Service]
                    () => {
                        const services = ['Success', 'Solutions', 'Service', 'Studio', 'Space', 'Spot', 'Shop', 'Store', 'Style', 'Support'];
                        return `${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} & ${services[Math.floor(Math.random() * services.length)]}`;
                    },
                    
                    // Pattern 9: [Business Type] [Professional]
                    () => {
                        const professionals = ['Pro', 'Plus', 'Prime', 'Perfect', 'Premium', 'Professional', 'Pioneer', 'Partner', 'Provider', 'Producer'];
                        return `${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} ${professionals[Math.floor(Math.random() * professionals.length)]}`;
                    },
                    
                    // Pattern 10: [Business Type] & [Company]
                    () => {
                        const companies = ['& Co.', '& Company', '& Crew', '& Collective', '& Corner', '& Craft', '& Culture', '& Circle', '& Club', '& Company'];
                        return `${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} ${companies[Math.floor(Math.random() * companies.length)]}`;
                    }
                ];
                
                return patterns[Math.floor(Math.random() * patterns.length)]();
            };
            
            return createBusinessName();
        };
        
        // Generate 3 unique names
        const names = [];
        const usedNames = new Set();
        
        while (names.length < 3) {
            const name = generateDynamicBusinessName();
            if (!usedNames.has(name)) {
                usedNames.add(name);
                names.push(name);
            }
        }
        
        return names;
    }

    generateAlternativeSuggestion(businessType, location) {
        const locationLower = location.toLowerCase();
        const alternatives = [];

        // Location-based alternatives
        if (locationLower.includes('university') || locationLower.includes('college')) {
            alternatives.push(
                'Student Tutoring Service - Higher demand and recurring revenue',
                'Campus Food Delivery - Leverage existing student population',
                'Student Housing Services - Address housing shortages',
                'Campus Tech Support - Students always need tech help',
                'Student Fitness Coaching - Health-conscious demographic'
            );
        } else if (locationLower.includes('downtown') || locationLower.includes('city center')) {
            alternatives.push(
                'Food Truck - Lower overhead than brick-and-mortar',
                'Personal Training - High-income professionals',
                'Web Design Agency - Business-to-business opportunities',
                'Pet Grooming - Urban pet owners with disposable income',
                'Mobile Car Detailing - Convenience for busy professionals'
            );
        } else if (locationLower.includes('beach') || locationLower.includes('coastal')) {
            alternatives.push(
                'Beach Equipment Rental - Seasonal tourism revenue',
                'Surf Lessons - Leverage natural environment',
                'Beach Photography - Tourist market opportunities',
                'Beach Food Truck - Mobile and seasonal flexibility',
                'Water Sports Equipment - Year-round local market'
            );
        } else if (locationLower.includes('suburban') || locationLower.includes('residential')) {
            alternatives.push(
                'Lawn Care Services - Steady residential demand',
                'House Cleaning - Busy families need help',
                'Pet Sitting - Suburban pet owners travel',
                'Personal Training - Health-conscious suburbanites',
                'Home Maintenance - Aging homes need upkeep'
            );
        } else if (locationLower.includes('tech') || locationLower.includes('silicon')) {
            alternatives.push(
                'Web Development Agency - Tech-savvy clientele',
                'IT Consulting - Growing tech companies',
                'Digital Marketing - Tech companies need marketing',
                'Tech Support - Always in demand',
                'Software Training - Skill development market'
            );
        } else if (locationLower.includes('tourist') || locationLower.includes('vacation')) {
            alternatives.push(
                'Tour Guide Services - Direct tourism revenue',
                'Souvenir Shop - Tourist impulse purchases',
                'Local Food Tours - Experience-based tourism',
                'Photography Services - Tourist memories',
                'Transportation Services - Tourist mobility needs'
            );
        }

        // Business-type specific alternatives
        if (businessType.includes('coffee') || businessType.includes('cafe')) {
            alternatives.push(
                'Food Truck - Lower overhead and flexibility',
                'Mobile Coffee Service - Office and event catering',
                'Coffee Bean Subscription - Recurring revenue model',
                'Coffee Equipment Sales - B2B opportunities',
                'Coffee Consulting - Help others start coffee businesses'
            );
        } else if (businessType.includes('pet') || businessType.includes('grooming')) {
            alternatives.push(
                'Mobile Pet Grooming - Convenience premium',
                'Pet Sitting Services - Lower overhead',
                'Pet Photography - Creative and profitable',
                'Pet Training - Higher value services',
                'Pet Supplies Store - Recurring purchases'
            );
        } else if (businessType.includes('web') || businessType.includes('design')) {
            alternatives.push(
                'Digital Marketing Agency - Broader service offering',
                'SEO Services - Recurring revenue model',
                'E-commerce Consulting - Growing market',
                'Content Creation - Scalable service',
                'App Development - Higher value projects'
            );
        } else if (businessType.includes('food truck') || businessType.includes('food')) {
            alternatives.push(
                'Ghost Kitchen - Lower overhead, delivery focus',
                'Catering Services - Higher value events',
                'Meal Prep Service - Subscription model',
                'Food Delivery Aggregator - Technology platform',
                'Food Consulting - Help others start food businesses'
            );
        } else if (businessType.includes('personal') && businessType.includes('train')) {
            alternatives.push(
                'Online Fitness Coaching - Scalable and global',
                'Group Fitness Classes - Higher revenue per hour',
                'Nutrition Consulting - Complementary service',
                'Fitness Equipment Sales - Product revenue',
                'Corporate Wellness Programs - B2B opportunities'
            );
        }

        // Default alternatives for any business
        alternatives.push(
            'Online Service - Lower overhead and global reach',
            'Subscription Model - Predictable recurring revenue',
            'B2B Services - Higher value clients',
            'Mobile Service - Convenience premium',
            'Consulting - Leverage expertise for higher rates'
        );

        // Return a random alternative that's different from the current business
        const filteredAlternatives = alternatives.filter(alt => 
            !alt.toLowerCase().includes(businessType.split(' ')[0]) && 
            !businessType.includes(alt.toLowerCase().split(' ')[0])
        );

        return filteredAlternatives.length > 0 
            ? filteredAlternatives[Math.floor(Math.random() * filteredAlternatives.length)]
            : 'Consider a mobile or online version of your business for lower overhead and broader reach.';
    }



    generateEntityRecommendation(businessType) {
        const businessTypeLower = businessType.toLowerCase();
        
        // Food service businesses
        if (businessTypeLower.includes('coffee') || businessTypeLower.includes('cafe') || 
            businessTypeLower.includes('restaurant') || businessTypeLower.includes('food')) {
            return {
                recommended: 'LLC (Limited Liability Company)',
                reasoning: 'Food service businesses face higher liability risks from food safety, customer injuries, and property damage. An LLC provides personal liability protection while offering tax flexibility.',
                benefits: [
                    'Personal liability protection from lawsuits',
                    'Pass-through taxation (avoid double taxation)',
                    'Flexible management structure',
                    'Easier to transfer ownership',
                    'Professional credibility with customers'
                ],
                considerations: [
                    'Annual filing requirements vary by state',
                    'May need additional insurance coverage',
                    'Consider S-Corp election for tax savings if profitable'
                ]
            };
        }
        
        // Pet service businesses
        if (businessTypeLower.includes('pet') || businessTypeLower.includes('grooming') || 
            businessTypeLower.includes('veterinary') || businessTypeLower.includes('animal')) {
            return {
                recommended: 'LLC (Limited Liability Company)',
                reasoning: 'Pet service businesses involve animal handling which can lead to injuries, property damage, or customer disputes. An LLC protects personal assets while maintaining operational flexibility.',
                benefits: [
                    'Protection from pet-related lawsuits',
                    'Professional liability coverage',
                    'Tax advantages for service businesses',
                    'Easy to add partners or investors',
                    'Credibility with pet owners'
                ],
                considerations: [
                    'May need specialized pet business insurance',
                    'Consider professional liability coverage',
                    'State-specific pet business regulations apply'
                ]
            };
        }
        
        // Technology/Web services
        if (businessTypeLower.includes('web') || businessTypeLower.includes('design') || 
            businessTypeLower.includes('development') || businessTypeLower.includes('tech') ||
            businessTypeLower.includes('software') || businessTypeLower.includes('digital')) {
            return {
                recommended: 'LLC or S-Corporation',
                reasoning: 'Tech businesses often have low startup costs but high growth potential. An LLC provides flexibility for early stages, while S-Corp can offer tax advantages as the business grows.',
                benefits: [
                    'Limited personal liability for intellectual property issues',
                    'Pass-through taxation benefits',
                    'Easy to add technical co-founders',
                    'Professional credibility with clients',
                    'Flexible profit distribution'
                ],
                considerations: [
                    'S-Corp requires reasonable salary for owners',
                    'May need professional liability insurance',
                    'Consider C-Corp if seeking venture capital'
                ]
            };
        }
        
        // Personal services (training, consulting, etc.)
        if (businessTypeLower.includes('personal') || businessTypeLower.includes('train') ||
            businessTypeLower.includes('consult') || businessTypeLower.includes('coach') ||
            businessTypeLower.includes('tutor')) {
            return {
                recommended: 'LLC (Limited Liability Company)',
                reasoning: 'Personal service businesses involve direct client interaction and potential liability from advice or services provided. An LLC offers protection while maintaining tax simplicity.',
                benefits: [
                    'Protection from professional liability claims',
                    'Pass-through taxation',
                    'Professional credibility',
                    'Easy to operate as solo entrepreneur',
                    'Flexible management structure'
                ],
                considerations: [
                    'Consider professional liability insurance',
                    'May need industry-specific certifications',
                    'S-Corp election possible for tax savings'
                ]
            }
        }
        
        // Mobile/Mobile service businesses
        if (businessTypeLower.includes('mobile') || businessTypeLower.includes('truck') ||
            businessTypeLower.includes('delivery') || businessTypeLower.includes('transport')) {
            return {
                recommended: 'LLC (Limited Liability Company)',
                reasoning: 'Mobile businesses face unique risks including vehicle accidents, property damage, and liability from mobile operations. An LLC provides essential protection for these risks.',
                benefits: [
                    'Protection from vehicle-related lawsuits',
                    'Coverage for property damage claims',
                    'Professional credibility with clients',
                    'Tax advantages for vehicle expenses',
                    'Easy to expand to multiple vehicles'
                ],
                considerations: [
                    'Requires commercial auto insurance',
                    'May need additional liability coverage',
                    'Consider fleet management structure'
                ]
            };
        }
        
        // Retail/Product-based businesses
        if (businessTypeLower.includes('retail') || businessTypeLower.includes('shop') ||
            businessTypeLower.includes('store') || businessTypeLower.includes('product')) {
            return {
                recommended: 'LLC (Limited Liability Company)',
                reasoning: 'Retail businesses face inventory risks, customer injuries, and product liability issues. An LLC provides protection while offering operational flexibility.',
                benefits: [
                    'Protection from product liability claims',
                    'Coverage for customer injury lawsuits',
                    'Tax advantages for inventory management',
                    'Professional credibility',
                    'Easy to add locations or partners'
                ],
                considerations: [
                    'May need product liability insurance',
                    'Consider inventory financing options',
                    'S-Corp election possible for tax benefits'
                ]
            };
        }
        
        // Default recommendation for other businesses
        return {
            recommended: 'LLC (Limited Liability Company)',
            reasoning: 'An LLC is generally the best choice for most small businesses as it provides personal liability protection, tax flexibility, and operational simplicity.',
            benefits: [
                'Personal liability protection',
                'Pass-through taxation',
                'Flexible management structure',
                'Professional credibility',
                'Easy to form and maintain'
            ],
            considerations: [
                'Annual filing requirements vary by state',
                'May need business insurance',
                'Consider S-Corp election if profitable',
                'Consult with attorney for specific advice'
            ]
        };
    }

    generateStepResources(businessType, stepNumber, stepTitle) {
        const resources = [];
        
        // Step 1: Business Registration & Legal
        if (stepNumber === 1) {
            resources.push(
                {
                    name: 'Business Registration',
                    link: 'https://www.sba.gov/business-guide/launch-your-business/register-your-business',
                    description: 'Register your business entity (LLC recommended for liability protection)'
                },
                {
                    name: 'Business Banking',
                    link: 'https://www.chase.com/business',
                    description: 'Business checking account and merchant services'
                },
                {
                    name: 'Business Insurance',
                    link: 'https://www.hiscox.com/small-business-insurance',
                    description: 'Liability insurance for small businesses'
                }
            );

            // Add business-specific permits and licenses
            if (businessType.includes('coffee') || businessType.includes('food') || businessType.includes('restaurant')) {
                resources.push(
                    {
                        name: 'Food Service Permits',
                        link: 'https://www.fda.gov/food/retail-food-industry/state-retail-and-food-service-codes-and-regulations',
                        description: 'State-specific food service regulations and permits'
                    },
                    {
                        name: 'Health Department Requirements',
                        link: 'https://www.cdc.gov/nceh/ehs/ehsnet/state_resources.htm',
                        description: 'Local health department contact information'
                    }
                );
            } else if (businessType.includes('pet') || businessType.includes('grooming')) {
                resources.push(
                    {
                        name: 'Pet Grooming Certification',
                        link: 'https://www.nationaldoggroomers.com/',
                        description: 'Professional pet grooming certification programs'
                    },
                    {
                        name: 'Local Pet Care Regulations',
                        link: 'https://www.avma.org/policies/state-licensing-and-regulation',
                        description: 'State-specific pet care business regulations'
                    }
                );
            } else if (businessType.includes('web') || businessType.includes('design') || businessType.includes('development')) {
                resources.push(
                    {
                        name: 'Professional Liability Insurance',
                        link: 'https://www.hiscox.com/small-business-insurance',
                        description: 'Professional liability insurance for web designers'
                    },
                    {
                        name: 'Accounting Software',
                        link: 'https://quickbooks.intuit.com/',
                        description: 'QuickBooks for business accounting and invoicing'
                    }
                );
            }

            // Add payroll solution recommendation for all business types
            resources.push(
                {
                    name: 'Payroll & HR Platform',
                    link: 'https://gusto.com',
                    description: 'Complete payroll, benefits, and HR platform for small businesses'
                }
            );
        }

        // Step 2: Location & Setup
        if (stepNumber === 2) {
            resources.push(
                {
                    name: 'Commercial Real Estate',
                    link: 'https://www.loopnet.com/',
                    description: 'Find available commercial properties and retail spaces'
                },
                {
                    name: 'Contractor Directory',
                    link: 'https://www.angieslist.com/',
                    description: 'Find licensed contractors for build-out work'
                }
            );

            // Add business-specific equipment and setup resources
            if (businessType.includes('coffee') || businessType.includes('cafe')) {
                resources.push(
                    {
                        name: 'Commercial Coffee Equipment',
                        link: 'https://www.webstaurantstore.com/coffee-equipment.html',
                        description: 'Commercial coffee machines, grinders, and accessories'
                    },
                    {
                        name: 'Restaurant Furniture',
                        link: 'https://www.webstaurantstore.com/restaurant-furniture.html',
                        description: 'Tables, chairs, and seating for coffee shop'
                    }
                );
            } else if (businessType.includes('pet') || businessType.includes('grooming')) {
                resources.push(
                    {
                        name: 'Grooming Equipment',
                        link: 'https://www.groomerschoice.com/',
                        description: 'Professional grooming tables, tubs, and equipment'
                    },
                    {
                        name: 'Safety Equipment',
                        link: 'https://www.groomerschoice.com/safety-equipment',
                        description: 'Safety restraints, muzzles, and protective gear'
                    }
                );
            } else if (businessType.includes('web') || businessType.includes('design')) {
                resources.push(
                    {
                        name: 'Portfolio Website Builder',
                        link: 'https://www.squarespace.com/',
                        description: 'Professional portfolio website templates'
                    },
                    {
                        name: 'Domain Registration',
                        link: 'https://domains.google.com/',
                        description: 'Register your business domain name'
                    }
                );
            }
        }

        // Step 3: Equipment & Supplies
        if (stepNumber === 3) {
            if (businessType.includes('coffee') || businessType.includes('cafe')) {
                resources.push(
                    {
                        name: 'Coffee Bean Suppliers',
                        link: 'https://www.coffeeam.com/',
                        description: 'Wholesale coffee beans and roasting services'
                    },
                    {
                        name: 'Commercial Refrigeration',
                        link: 'https://www.webstaurantstore.com/refrigeration.html',
                        description: 'Commercial refrigerators and freezers'
                    },
                    {
                        name: 'Food Service Equipment',
                        link: 'https://www.webstaurantstore.com/',
                        description: 'Complete restaurant equipment and supplies'
                    }
                );
            } else if (businessType.includes('pet') || businessType.includes('grooming')) {
                resources.push(
                    {
                        name: 'Grooming Tools',
                        link: 'https://www.groomerschoice.com/grooming-tools',
                        description: 'Professional clippers, scissors, and grooming tools'
                    },
                    {
                        name: 'Pet Care Products',
                        link: 'https://www.groomerschoice.com/shampoos-conditioners',
                        description: 'Professional shampoos, conditioners, and pet care products'
                    },
                    {
                        name: 'Grooming Dryers',
                        link: 'https://www.groomerschoice.com/dryers',
                        description: 'Professional pet dryers and grooming equipment'
                    }
                );
            } else if (businessType.includes('web') || businessType.includes('design')) {
                resources.push(
                    {
                        name: 'Code Editor',
                        link: 'https://code.visualstudio.com/',
                        description: 'VS Code - professional code editor'
                    },
                    {
                        name: 'Design Tools',
                        link: 'https://www.figma.com/',
                        description: 'Figma for web design and prototyping'
                    },
                    {
                        name: 'Web Hosting',
                        link: 'https://www.bluehost.com/',
                        description: 'Reliable web hosting for your portfolio site'
                    }
                );
            }
        }

        // Step 4: Hiring & Training
        if (stepNumber === 4) {
            resources.push(
                {
                    name: 'Job Posting Sites',
                    link: 'https://www.indeed.com/',
                    description: 'Post job listings for your business'
                },
                {
                    name: 'Employee Management Platform',
                    link: 'https://www.gusto.com/',
                    description: 'Payroll and HR management for small businesses'
                }
            );

            // Add business-specific training resources
            if (businessType.includes('coffee') || businessType.includes('cafe')) {
                resources.push(
                    {
                        name: 'Barista Training Programs',
                        link: 'https://www.sca.coffee/education',
                        description: 'Specialty Coffee Association training resources'
                    }
                );
            } else if (businessType.includes('pet') || businessType.includes('grooming')) {
                resources.push(
                    {
                        name: 'Grooming Training',
                        link: 'https://www.nationaldoggroomers.com/education',
                        description: 'Professional grooming training and certification'
                    },
                    {
                        name: 'Safety Training',
                        link: 'https://www.osha.gov/',
                        description: 'Workplace safety training and compliance'
                    }
                );
            } else if (businessType.includes('web') || businessType.includes('design')) {
                resources.push(
                    {
                        name: 'Project Management',
                        link: 'https://trello.com/',
                        description: 'Trello for project and client management'
                    },
                    {
                        name: 'Version Control',
                        link: 'https://github.com/',
                        description: 'GitHub for code version control and collaboration'
                    }
                );
            }
        }

        // Step 5: Marketing & Launch
        if (stepNumber === 5) {
            resources.push(
                {
                    name: 'Social Media Management',
                    link: 'https://business.facebook.com/',
                    description: 'Create and manage business social media accounts'
                },
                {
                    name: 'Local Business Directory',
                    link: 'https://www.google.com/business/',
                    description: 'Google My Business for local visibility'
                }
            );

            // Add business-specific marketing resources
            if (businessType.includes('coffee') || businessType.includes('cafe')) {
                resources.push(
                    {
                        name: 'Loyalty Program Software',
                        link: 'https://www.loyaltysystems.com/',
                        description: 'Customer loyalty and rewards programs'
                    },
                    {
                        name: 'Event Planning Resources',
                        link: 'https://www.eventbrite.com/',
                        description: 'Plan and promote grand opening events'
                    }
                );
            } else if (businessType.includes('pet') || businessType.includes('grooming')) {
                resources.push(
                    {
                        name: 'Website Builder',
                        link: 'https://www.wix.com/',
                        description: 'Create professional website for your grooming business'
                    },
                    {
                        name: 'Local Veterinarian Network',
                        link: 'https://www.avma.org/find-a-veterinarian',
                        description: 'Find local veterinarians for partnerships'
                    }
                );
            } else if (businessType.includes('web') || businessType.includes('design')) {
                resources.push(
                    {
                        name: 'LinkedIn Marketing',
                        link: 'https://www.linkedin.com/',
                        description: 'Professional networking and lead generation'
                    },
                    {
                        name: 'Freelance Platforms',
                        link: 'https://www.upwork.com/',
                        description: 'Upwork for finding web design clients'
                    }
                );
            }
        }

        return resources;
    }

    generateSpecificBusinessPlan(specificBusiness, businessType) {
        // Helper function to capitalize first letter
        const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        
        // Coffee shop specific plan
        if (businessType.includes('coffee') || businessType.includes('cafe')) {
            return {
                overview: capitalizeFirst(`${specificBusiness} will be a cozy, community-focused coffee shop offering premium coffee, pastries, and a welcoming atmosphere for remote workers, students, and coffee enthusiasts.`),
                targetMarket: 'Remote workers, students, coffee enthusiasts, professionals aged 25-45, and local residents seeking a community gathering space.',
                revenueStreams: [
                    'Coffee and beverage sales',
                    'Food and pastry sales',
                    'Merchandise (mugs, coffee beans)',
                    'Catering services for events',
                    'Coffee subscription service'
                ],
                pricing: [
                    { item: 'Espresso', price: '$3.50' },
                    { item: 'Cappuccino', price: '$4.50' },
                    { item: 'Latte', price: '$4.75' },
                    { item: 'Pastry', price: '$3.25' },
                    { item: 'Sandwich', price: '$8.50' }
                ],
                revenueProjection: [
                    { year: 'Year 1', revenue: '$180,000' },
                    { year: 'Year 2', revenue: '$240,000' },
                    { year: 'Year 3', revenue: '$300,000' },
                    { year: 'Year 4', revenue: '$360,000' },
                    { year: 'Year 5', revenue: '$420,000' }
                ],
                startupSteps: [
                    {
                        title: 'Secure Location and Permits',
                        description: 'Find a high-traffic location, negotiate lease terms, and obtain all necessary business licenses, food service permits, and health department approvals.'
                    },
                    {
                        title: 'Design and Build Out',
                        description: 'Work with contractors to design the space layout, install coffee equipment, seating, and create an inviting atmosphere.'
                    },
                    {
                        title: 'Source Equipment and Suppliers',
                        description: 'Purchase commercial coffee machines, grinders, refrigerators, and establish relationships with coffee bean suppliers and food vendors.'
                    },
                    {
                        title: 'Hire and Train Staff',
                        description: 'Recruit baristas with coffee knowledge, train them on equipment operation, customer service, and coffee preparation techniques.'
                    },
                    {
                        title: 'Launch Marketing Campaign',
                        description: 'Create social media presence, host grand opening event, partner with local businesses, and implement loyalty program.'
                    }
                ],
                marketingStrategies: [
                    'Social media marketing (Instagram, Facebook)',
                    'Local business partnerships',
                    'Loyalty program and rewards',
                    'Community events and workshops',
                    'Local influencer collaborations'
                ],
                challenges: [
                    'High initial investment in equipment and build-out',
                    'Competition from established coffee chains',
                    'Seasonal fluctuations in customer traffic',
                    'Staff training and retention',
                    'Maintaining consistent quality and service'
                ]
            };
        }

        // Pet grooming specific plan
        if (businessType.includes('pet') || businessType.includes('grooming')) {
            return {
                overview: `${specificBusiness} will provide professional pet grooming services including bathing, haircuts, nail trimming, and specialized treatments for dogs and cats in a clean, safe, and stress-free environment.`,
                targetMarket: 'Pet owners aged 25-65, busy professionals, elderly pet owners, and customers seeking premium pet care services.',
                revenueStreams: [
                    'Pet grooming services',
                    'Specialized treatments (flea baths, de-shedding)',
                    'Pet accessories and products',
                    'Mobile grooming services',
                    'Pet photography packages'
                ],
                pricing: [
                    { item: 'Small Dog Grooming', price: '$45' },
                    { item: 'Medium Dog Grooming', price: '$65' },
                    { item: 'Large Dog Grooming', price: '$85' },
                    { item: 'Cat Grooming', price: '$55' },
                    { item: 'Nail Trim', price: '$15' }
                ],
                revenueProjection: [
                    { year: 'Year 1', revenue: '$120,000' },
                    { year: 'Year 2', revenue: '$180,000' },
                    { year: 'Year 3', revenue: '$240,000' },
                    { year: 'Year 4', revenue: '$300,000' },
                    { year: 'Year 5', revenue: '$360,000' }
                ],
                startupSteps: [
                    {
                        title: 'Obtain Licenses and Insurance',
                        description: 'Get business license, pet grooming certification, liability insurance, and ensure compliance with local pet care regulations.'
                    },
                    {
                        title: 'Set Up Grooming Facility',
                        description: 'Design and equip grooming space with professional equipment, bathing stations, grooming tables, and safety features.'
                    },
                    {
                        title: 'Purchase Equipment and Supplies',
                        description: 'Invest in professional grooming tools, shampoos, conditioners, clippers, dryers, and safety equipment.'
                    },
                    {
                        title: 'Hire and Train Staff',
                        description: 'Recruit experienced groomers, provide additional training on safety protocols, customer service, and specialized grooming techniques.'
                    },
                    {
                        title: 'Establish Client Base',
                        description: 'Create website, social media presence, partner with local veterinarians, and implement referral program.'
                    }
                ],
                marketingStrategies: [
                    'Social media showcasing before/after photos',
                    'Partnerships with local veterinarians',
                    'Referral program for existing clients',
                    'Local pet store collaborations',
                    'Community pet events participation'
                ],
                challenges: [
                    'Managing pet behavior and safety concerns',
                    'Seasonal demand fluctuations',
                    'Equipment maintenance and replacement costs',
                    'Staff training and certification requirements',
                    'Building trust with pet owners'
                ]
            };
        }

        // Web design specific plan
        if (businessType.includes('web') || businessType.includes('design') || businessType.includes('development')) {
            return {
                overview: `${specificBusiness} will provide professional web design and development services, creating modern, responsive websites and digital solutions for small businesses and entrepreneurs.`,
                targetMarket: 'Small business owners, entrepreneurs, startups, local businesses, and professionals needing online presence.',
                revenueStreams: [
                    'Website design and development',
                    'E-commerce solutions',
                    'Website maintenance and updates',
                    'SEO and digital marketing',
                    'Custom web applications'
                ],
                pricing: [
                    { item: 'Basic Website', price: '$2,500' },
                    { item: 'E-commerce Website', price: '$5,000' },
                    { item: 'Custom Web Application', price: '$8,000' },
                    { item: 'Monthly Maintenance', price: '$150' },
                    { item: 'SEO Package', price: '$500/month' }
                ],
                revenueProjection: [
                    { year: 'Year 1', revenue: '$80,000' },
                    { year: 'Year 2', revenue: '$140,000' },
                    { year: 'Year 3', revenue: '$200,000' },
                    { year: 'Year 4', revenue: '$280,000' },
                    { year: 'Year 5', revenue: '$350,000' }
                ],
                startupSteps: [
                    {
                        title: 'Establish Business Structure',
                        description: 'Register business, set up LLC or corporation, obtain necessary licenses, and establish business bank account and accounting system.'
                    },
                    {
                        title: 'Build Portfolio and Website',
                        description: 'Create personal portfolio website, develop sample projects, and establish professional online presence to showcase skills.'
                    },
                    {
                        title: 'Set Up Development Environment',
                        description: 'Invest in professional development tools, hosting services, domain management, and project management software.'
                    },
                    {
                        title: 'Create Service Packages',
                        description: 'Define service offerings, pricing structure, project timelines, and develop contracts and proposal templates.'
                    },
                    {
                        title: 'Launch Marketing Strategy',
                        description: 'Create professional website, establish social media presence, network with local businesses, and implement referral system.'
                    }
                ],
                marketingStrategies: [
                    'Professional portfolio website',
                    'Social media marketing (LinkedIn, Twitter)',
                    'Local business networking',
                    'Content marketing and blogging',
                    'Referral partnerships with marketing agencies'
                ],
                challenges: [
                    'Staying current with technology trends',
                    'Managing client expectations and revisions',
                    'Competition from large agencies and freelancers',
                    'Project timeline management',
                    'Scaling business while maintaining quality'
                ]
            };
        }

        // Food truck specific plan
        if (businessType.includes('food truck') || businessType.includes('food') && businessType.includes('truck')) {
            return {
                overview: `${specificBusiness} will be a mobile food service offering delicious, high-quality meals at various locations including office parks, events, and popular gathering spots.`,
                targetMarket: 'Office workers, event attendees, food enthusiasts, busy professionals, and customers seeking convenient, quality food options.',
                revenueStreams: [
                    'Food sales at various locations',
                    'Catering for private events',
                    'Food delivery partnerships',
                    'Merchandise sales',
                    'Cooking classes and workshops'
                ],
                pricing: [
                    { item: 'Main Entree', price: '$12' },
                    { item: 'Side Dish', price: '$6' },
                    { item: 'Beverage', price: '$3' },
                    { item: 'Dessert', price: '$5' },
                    { item: 'Combo Meal', price: '$15' }
                ],
                revenueProjection: [
                    { year: 'Year 1', revenue: '$150,000' },
                    { year: 'Year 2', revenue: '$220,000' },
                    { year: 'Year 3', revenue: '$300,000' },
                    { year: 'Year 4', revenue: '$380,000' },
                    { year: 'Year 5', revenue: '$450,000' }
                ],
                startupSteps: [
                    {
                        title: 'Obtain Permits and Licenses',
                        description: 'Get food truck permit, business license, health department approval, and ensure compliance with local food service regulations.'
                    },
                    {
                        title: 'Purchase and Equip Food Truck',
                        description: 'Buy or lease food truck, install commercial kitchen equipment, refrigeration, and ensure all safety requirements are met.'
                    },
                    {
                        title: 'Develop Menu and Source Suppliers',
                        description: 'Create menu items, establish relationships with food suppliers, and develop efficient food preparation processes.'
                    },
                    {
                        title: 'Hire and Train Staff',
                        description: 'Recruit kitchen staff and servers, train them on food safety, customer service, and efficient food preparation.'
                    },
                    {
                        title: 'Establish Locations and Schedule',
                        description: 'Identify high-traffic locations, obtain necessary permits for each location, and create regular schedule and route.'
                    }
                ],
                marketingStrategies: [
                    'Social media updates on location and menu',
                    'Partnerships with local businesses',
                    'Food truck festivals and events',
                    'Loyalty program for regular customers',
                    'Local food blogger collaborations'
                ],
                challenges: [
                    'Weather-dependent operations',
                    'Location permits and regulations',
                    'Equipment maintenance and repairs',
                    'Food safety and health compliance',
                    'Managing inventory and waste'
                ]
            };
        }

        // Personal training specific plan
        if (businessType.includes('personal') && businessType.includes('train')) {
            return {
                overview: `${specificBusiness} will provide personalized fitness training services, helping clients achieve their health and fitness goals through customized workout plans and nutrition guidance.`,
                targetMarket: 'Fitness enthusiasts, busy professionals, individuals with specific fitness goals, and people seeking personalized health guidance.',
                revenueStreams: [
                    'One-on-one personal training sessions',
                    'Group fitness classes',
                    'Online training programs',
                    'Nutrition consultation',
                    'Fitness equipment sales'
                ],
                pricing: [
                    { item: 'Single Session', price: '$75' },
                    { item: '10-Session Package', price: '$650' },
                    { item: 'Monthly Unlimited', price: '$300' },
                    { item: 'Group Class', price: '$25' },
                    { item: 'Nutrition Consultation', price: '$100' }
                ],
                revenueProjection: [
                    { year: 'Year 1', revenue: '$90,000' },
                    { year: 'Year 2', revenue: '$150,000' },
                    { year: 'Year 3', revenue: '$220,000' },
                    { year: 'Year 4', revenue: '$300,000' },
                    { year: 'Year 5', revenue: '$380,000' }
                ],
                startupSteps: [
                    {
                        title: 'Obtain Certifications and Insurance',
                        description: 'Get personal training certification, CPR/first aid certification, liability insurance, and ensure compliance with fitness industry standards.'
                    },
                    {
                        title: 'Set Up Training Space',
                        description: 'Secure gym space or set up home studio with essential equipment, or establish mobile training service capabilities.'
                    },
                    {
                        title: 'Purchase Equipment and Supplies',
                        description: 'Invest in fitness equipment, training tools, assessment devices, and professional training materials.'
                    },
                    {
                        title: 'Develop Training Programs',
                        description: 'Create customized workout plans, nutrition guides, and assessment protocols for different client types and goals.'
                    },
                    {
                        title: 'Build Client Base',
                        description: 'Create professional website, establish social media presence, network with local gyms, and implement referral program.'
                    }
                ],
                marketingStrategies: [
                    'Social media showcasing client transformations',
                    'Partnerships with local gyms and health clubs',
                    'Free fitness assessments and consultations',
                    'Referral program for existing clients',
                    'Community fitness events and workshops'
                ],
                challenges: [
                    'Building and maintaining client base',
                    'Managing different fitness levels and limitations',
                    'Staying current with fitness trends and research',
                    'Balancing personal training with business management',
                    'Seasonal fluctuations in client demand'
                ]
            };
        }

        // Default generic plan
        return {
            overview: `${specificBusiness} will provide high-quality services to meet the needs of the local community, focusing on customer satisfaction and sustainable business growth.`,
            targetMarket: 'Local residents, businesses, and individuals seeking quality services in the area.',
            revenueStreams: [
                'Primary service offerings',
                'Additional service packages',
                'Product sales',
                'Consultation services',
                'Maintenance and support'
            ],
            pricing: [
                { item: 'Basic Service', price: '$50' },
                { item: 'Standard Package', price: '$100' },
                { item: 'Premium Service', price: '$150' },
                { item: 'Consultation', price: '$75' },
                { item: 'Maintenance', price: '$25' }
            ],
            revenueProjection: [
                { year: 'Year 1', revenue: '$100,000' },
                { year: 'Year 2', revenue: '$150,000' },
                { year: 'Year 3', revenue: '$200,000' },
                { year: 'Year 4', revenue: '$250,000' },
                { year: 'Year 5', revenue: '$300,000' }
            ],
            startupSteps: [
                {
                    title: 'Business Planning and Registration',
                    description: 'Develop comprehensive business plan, register business entity, obtain necessary licenses and permits, and set up business accounts.'
                },
                {
                    title: 'Set Up Operations',
                    description: 'Secure location or workspace, purchase necessary equipment and supplies, and establish operational procedures and systems.'
                },
                {
                    title: 'Develop Service Offerings',
                    description: 'Define core services, pricing structure, and quality standards. Create service packages and delivery processes.'
                },
                {
                    title: 'Build Team and Training',
                    description: 'Hire qualified staff, provide comprehensive training on services, customer service, and business operations.'
                },
                {
                    title: 'Launch Marketing Campaign',
                    description: 'Create professional website, establish social media presence, implement local marketing strategies, and build community relationships.'
                }
            ],
            marketingStrategies: [
                'Local advertising and community outreach',
                'Social media marketing',
                'Referral programs',
                'Partnerships with complementary businesses',
                'Customer loyalty programs'
            ],
            challenges: [
                'Building brand awareness and trust',
                'Managing cash flow and expenses',
                'Competition from established businesses',
                'Staff recruitment and retention',
                'Scaling operations while maintaining quality'
            ]
        };
    }

    generateLocationRationale(location, businessType) {
        const locationLower = location.toLowerCase();
        
        if (locationLower.includes('university') || locationLower.includes('college')) {
            return `This location is ideal for a ${businessType} business due to the high concentration of students, faculty, and staff who are always seeking convenient services. The university environment provides a steady customer base with regular foot traffic and a community that values quality and convenience.`;
        }
        
        if (locationLower.includes('downtown') || locationLower.includes('city center')) {
            return `Downtown ${location} offers excellent visibility and accessibility for a ${businessType} business. The high foot traffic, proximity to offices and retail establishments, and central location make it an ideal spot for attracting both local residents and visitors.`;
        }
        
        if (locationLower.includes('beach') || locationLower.includes('coastal')) {
            return `The beach location provides a unique opportunity for a ${businessType} business to serve tourists and locals enjoying the coastal lifestyle. The seasonal tourism creates additional revenue opportunities while the local community provides year-round support.`;
        }
        
        if (locationLower.includes('suburban') || locationLower.includes('residential')) {
            return `This suburban location is perfect for a ${businessType} business serving families and local residents. The area offers a stable customer base, lower competition compared to urban areas, and opportunities to build strong community relationships.`;
        }
        
        return `This location offers great potential for a ${businessType} business with its mix of local residents and potential customers. The area provides good accessibility and visibility while offering opportunities for growth and community engagement.`;
    }

    displayBusinessPlan(businessPlanData) {
        // Store data for regeneration
        localStorage.setItem('currentBusinessType', businessPlanData.business);
        localStorage.setItem('currentLocation', businessPlanData.location);
        
        const planContent = document.getElementById('planContent');
        // Clear content first to force refresh
        planContent.innerHTML = '';
        // Add a small delay to ensure DOM is cleared
        setTimeout(() => {
            planContent.innerHTML = this.generateBusinessPlanHTML(businessPlanData);
            console.log('Business plan HTML regenerated at:', new Date().toLocaleTimeString());
        }, 10);
    }

    generateBusinessPlanHTML(data) {
        console.log('Generating business plan HTML with data:', data);
        console.log('Business names in data:', data.businessNames);
        const timestamp = new Date().getTime();
        return `
            <!-- CACHE BUSTER: ${timestamp} -->
            <div class="business-names-section">
                <h3><i class="fas fa-signature"></i> Potential Business Names</h3>
                <p class="names-subtitle">Click on any name to copy it to clipboard</p>
                <div class="business-names-grid">
                    ${data.businessNames && data.businessNames.length > 0 ? 
                        data.businessNames.map((name, index) => `
                            <div class="business-name-option" onclick="copyBusinessName('${name.replace(/'/g, "\\'")}', ${index + 1})" title="Click to copy">
                                <span class="name-number">${index + 1}</span>
                                <span class="name-text">${name}</span>
                                <span class="copy-icon"><i class="fas fa-copy"></i></span>
                            </div>
                        `).join('') : 
                        '<p>Business names will be generated here...</p>'
                    }
                </div>
                <div class="names-actions">
                    <button class="regenerate-names-btn" onclick="regenerateBusinessNames()">
                        <i class="fas fa-refresh"></i> Generate New Names
                    </button>
                    <button class="names-help-btn" onclick="showNamesHelp()">
                        <i class="fas fa-lightbulb"></i> Naming Tips
                    </button>
                </div>
            </div>

            <div class="location-rationale">
                <h3><i class="fas fa-map-marker-alt"></i> Why This Location?</h3>
                <p>${data.locationRationale}</p>
            </div>

            <h3><i class="fas fa-info-circle"></i> Business Overview</h3>
            <p>${data.overview}</p>

            <h3><i class="fas fa-users"></i> Target Market</h3>
            <p>${data.targetMarket}</p>

            <h3><i class="fas fa-dollar-sign"></i> Revenue Streams</h3>
            <ul>
                ${data.revenueStreams.map(stream => `<li>${stream}</li>`).join('')}
            </ul>

            <h3><i class="fas fa-tags"></i> Suggested Pricing</h3>
            <div class="pricing-grid">
                ${data.pricing.map(item => `
                    <div class="pricing-item">
                        <h4>${item.item}</h4>
                        <p>${item.price}</p>
                    </div>
                `).join('')}
            </div>

            <h3><i class="fas fa-chart-line"></i> 5-Year Revenue Projection</h3>
            <div class="revenue-chart">
                ${data.revenueProjection.map(item => `
                    <div class="revenue-item">
                        <span>${item.year}</span>
                        <span>${item.revenue}</span>
                    </div>
                `).join('')}
            </div>

            <h3><i class="fas fa-tasks"></i> First 5 Steps to Get Started</h3>
            <div class="setup-steps">
                ${data.startupSteps.map((step, index) => `
                    <div class="setup-step">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <h4>${step.title}</h4>
                            <p>${step.description}</p>
                            ${step.resources ? `
                                <div class="step-resources">
                                    <h5><i class="fas fa-link"></i> Helpful Resources:</h5>
                                    <div class="resource-links">
                                        ${step.resources.map(resource => `
                                            <a href="${resource.link}" target="_blank" class="resource-link">
                                                <i class="fas fa-external-link-alt"></i>
                                                <span class="resource-name">${resource.name}</span>
                                                <span class="resource-desc">${resource.description}</span>
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <h3><i class="fas fa-bullhorn"></i> Marketing Strategies</h3>
            <ul>
                ${data.marketingStrategies.map(strategy => `<li>${strategy}</li>`).join('')}
            </ul>

            <h3><i class="fas fa-exclamation-triangle"></i> Potential Challenges</h3>
            <ul>
                ${data.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
            </ul>

            ${this.generateActionToolsHTML()}


        `;
    }

    generateActionToolsHTML() {
        return `
            <div class="action-tools-section">
                <h3><i class="fas fa-tools"></i> Action Tools</h3>
                
                <div class="market-research-tool">
                    <div class="tool-header">
                        <i class="fas fa-search"></i>
                        <h4>Market Research Checklist</h4>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="checklist">
                        <div class="checklist-item">
                            <input type="checkbox" id="research1">
                            <label for="research1">Analyze local competition</label>
                        </div>
                        <div class="checklist-item">
                            <input type="checkbox" id="research2">
                            <label for="research2">Survey potential customers</label>
                        </div>
                        <div class="checklist-item">
                            <input type="checkbox" id="research3">
                            <label for="research3">Research local demographics</label>
                        </div>
                        <div class="checklist-item">
                            <input type="checkbox" id="research4">
                            <label for="research4">Study industry trends</label>
                        </div>
                        <div class="checklist-item">
                            <input type="checkbox" id="research5">
                            <label for="research5">Identify target market segments</label>
                        </div>
                    </div>
                </div>

                <div class="marketing-materials-tool">
                    <div class="tool-header">
                        <i class="fas fa-palette"></i>
                        <h4>Marketing Materials Generator</h4>
                    </div>
                    <button class="copy-btn" onclick="generateMarketingMaterials()">Generate Materials</button>
                    <div id="marketingMaterials"></div>
                </div>

                <div class="competitor-analysis-tool">
                    <div class="tool-header">
                        <i class="fas fa-chart-bar"></i>
                        <h4>Automated Competitive Research</h4>
                    </div>
                    <div class="auto-research-section">
                        <button class="btn-primary" onclick="conductAutomatedResearch()" id="autoResearchBtn">
                            <i class="fas fa-search"></i> Analyze Market Competition
                        </button>
                        <p class="research-note">This will analyze businesses in your region and compare with other areas to assess competitive landscape.</p>
                    </div>
                    <div id="automatedResearchResults" style="display: none;">
                        <div class="research-summary">
                            <h5><i class="fas fa-chart-pie"></i> Market Analysis Summary</h5>
                            <div id="researchSummary"></div>
                        </div>
                        <div class="competition-grade">
                            <h5><i class="fas fa-star"></i> Competition Grade</h5>
                            <div id="competitionGrade"></div>
                        </div>
                        <div class="regional-comparison">
                            <h5><i class="fas fa-globe"></i> Regional Comparison</h5>
                            <div id="regionalComparison"></div>
                        </div>
                        <div class="opportunity-analysis">
                            <h5><i class="fas fa-lightbulb"></i> Opportunity Analysis</h5>
                            <div id="opportunityAnalysis"></div>
                        </div>
                    </div>
                    <div class="manual-research-section">
                        <h5><i class="fas fa-edit"></i> Manual Competitor Research</h5>
                        <div class="competitor-form">
                            <input type="text" id="competitorName" placeholder="Competitor name">
                            <input type="text" id="competitorWebsite" placeholder="Website (optional)">
                            <input type="text" id="competitorLocation" placeholder="Location">
                            <input type="text" id="competitorPricing" placeholder="Price range (e.g., $50-150)">
                            <textarea id="competitorStrengths" placeholder="Key strengths, unique features, what they do well"></textarea>
                            <textarea id="competitorWeaknesses" placeholder="Key weaknesses, gaps, customer complaints"></textarea>
                            <input type="text" id="competitorTargetMarket" placeholder="Their target market">
                            <button class="add-competitor-btn" onclick="addCompetitor()">Add Competitor</button>
                        </div>
                        <div id="competitorsList"></div>
                        <div id="competitiveInsights" style="display: none;">
                            <h5>Competitive Insights & Recommendations</h5>
                            <div id="insightsContent"></div>
                        </div>
                    </div>
                </div>

                <div class="financial-planning-tool">
                    <div class="tool-header">
                        <i class="fas fa-calculator"></i>
                        <h4>Financial Calculator</h4>
                    </div>
                    <div class="calculator-section">
                        <input type="number" id="startupCosts" placeholder="Startup costs ($)">
                        <input type="number" id="monthlyExpenses" placeholder="Monthly expenses ($)">
                        <input type="number" id="expectedRevenue" placeholder="Expected monthly revenue ($)">
                        <button class="calculate-btn" onclick="calculateFinancials()">Calculate</button>
                        <div id="financialResults"></div>
                    </div>
                </div>
            </div>
        `;
    }

    startOver() {
        document.getElementById('businessInput').value = '';
        document.getElementById('locationInput').value = '';
        document.getElementById('planSection').style.display = 'none';
        document.getElementById('businessSection').style.display = 'block';
        this.checkFormCompletion();
    }
}

// Global helper functions for action tools
async function conductAutomatedResearch() {
    // Get the current business plan data from localStorage or use stored values
    const currentBusinessType = localStorage.getItem('currentBusinessType') || '';
    const currentLocation = localStorage.getItem('currentLocation') || '';
    const autoResearchBtn = document.getElementById('autoResearchBtn');
    const resultsDiv = document.getElementById('automatedResearchResults');

    console.log('Starting automated research for:', currentBusinessType, 'in', currentLocation);

    if (!currentLocation || !currentBusinessType) {
        alert('Please generate a business plan first to analyze the market.');
        return;
    }

    // Show loading state
    autoResearchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Market...';
    autoResearchBtn.disabled = true;
    resultsDiv.style.display = 'none';

    try {
        // Simulate API calls and data processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate comprehensive market analysis
        const marketAnalysis = await generateMarketAnalysis(currentBusinessType, currentLocation);
        console.log('Market analysis generated:', marketAnalysis);
        
        // Display results
        displayAutomatedResearchResults(marketAnalysis);
        resultsDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Research error:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Unable to complete market analysis. Please try again. Error: ' + error.message);
    } finally {
        autoResearchBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Market Competition';
        autoResearchBtn.disabled = false;
    }
}

async function generateMarketAnalysis(businessType, location) {
    // Simulate comprehensive market research
    const locationData = await simulateLocationResearch(location);
    const businessData = await simulateBusinessResearch(businessType, location);
    const regionalComparison = await simulateRegionalComparison(businessType, location);
    
    return {
        location: location,
        businessType: businessType,
        localCompetitors: businessData.localCompetitors,
        regionalCompetitors: regionalComparison.regionalData,
        marketSaturation: businessData.saturation,
        competitionGrade: calculateCompetitionGrade(businessData, regionalComparison),
        opportunities: identifyOpportunities(businessData, regionalComparison),
        risks: identifyRisks(businessData, regionalComparison),
        recommendations: generateRecommendations(businessData, regionalComparison)
    };
}

async function simulateLocationResearch(location) {
    // Simulate location-based research
    const population = Math.floor(Math.random() * 500000) + 50000;
    const medianIncome = Math.floor(Math.random() * 50000) + 30000;
    const businessDensity = Math.random() * 0.8 + 0.2;
    
    return {
        population,
        medianIncome,
        businessDensity,
        growthRate: Math.random() * 0.1 + 0.02,
        unemploymentRate: Math.random() * 0.08 + 0.03
    };
}

async function simulateBusinessResearch(businessType, location) {
    // Simulate business-specific research
    const competitorCount = Math.floor(Math.random() * 20) + 1;
    const saturation = Math.random();
    const averageRating = Math.random() * 2 + 3; // 3-5 stars
    const averageRevenue = Math.floor(Math.random() * 500000) + 100000;
    
    const competitors = [];
    for (let i = 0; i < Math.min(competitorCount, 5); i++) {
        competitors.push({
            name: generateCompetitorName(businessType),
            rating: Math.random() * 2 + 3,
            yearsInBusiness: Math.floor(Math.random() * 10) + 1,
            estimatedRevenue: Math.floor(Math.random() * 300000) + 50000,
            strengths: generateRandomStrengths(),
            weaknesses: generateRandomWeaknesses()
        });
    }
    
    return {
        localCompetitors: competitors,
        saturation,
        averageRating,
        averageRevenue,
        marketGrowth: Math.random() * 0.15 + 0.05
    };
}

async function simulateRegionalComparison(businessType, location) {
    // Simulate comparison with other regions
    const regions = ['Austin, TX', 'Denver, CO', 'Portland, OR', 'Nashville, TN', 'Raleigh, NC'];
    const regionalData = {};
    
    regions.forEach(region => {
        regionalData[region] = {
            competitorCount: Math.floor(Math.random() * 25) + 1,
            saturation: Math.random(),
            averageRating: Math.random() * 2 + 3,
            marketGrowth: Math.random() * 0.2 + 0.03
        };
    });
    
    return { regionalData };
}

function calculateCompetitionGrade(businessData, regionalComparison) {
    const localSaturation = businessData.saturation;
    const localCompetitors = businessData.localCompetitors.length;
    const regionalSaturation = Object.values(regionalComparison.regionalData)
        .reduce((sum, data) => sum + data.saturation, 0) / Object.keys(regionalComparison.regionalData).length;
    
    let score = 0;
    
    // Saturation analysis (0-40 points)
    if (localSaturation < 0.3) score += 40;
    else if (localSaturation < 0.5) score += 30;
    else if (localSaturation < 0.7) score += 20;
    else score += 10;
    
    // Competitor count analysis (0-30 points)
    if (localCompetitors < 3) score += 30;
    else if (localCompetitors < 7) score += 25;
    else if (localCompetitors < 12) score += 20;
    else score += 10;
    
    // Regional comparison (0-30 points)
    if (localSaturation < regionalSaturation * 0.8) score += 30;
    else if (localSaturation < regionalSaturation) score += 20;
    else score += 10;
    
    // Convert to letter grade
    if (score >= 85) return { grade: 'A', score, description: 'Excellent opportunity - low competition' };
    if (score >= 75) return { grade: 'B', score, description: 'Good opportunity - moderate competition' };
    if (score >= 65) return { grade: 'C', score, description: 'Fair opportunity - some competition' };
    if (score >= 55) return { grade: 'D', score, description: 'Challenging - high competition' };
    return { grade: 'F', score, description: 'Very difficult - saturated market' };
}

function identifyOpportunities(businessData, regionalComparison) {
    const opportunities = [];
    
    if (businessData.saturation < 0.4) {
        opportunities.push('Low market saturation - room for new entrants');
    }
    
    if (businessData.averageRating < 4.0) {
        opportunities.push('Below-average competitor ratings - quality gap exists');
    }
    
    const underservedSegments = ['premium services', 'eco-friendly options', 'mobile services', '24/7 availability'];
    opportunities.push(`Potential to serve underserved segments: ${underservedSegments[Math.floor(Math.random() * underservedSegments.length)]}`);
    
    if (businessData.marketGrowth > 0.1) {
        opportunities.push('Growing market - timing is favorable');
    }
    
    return opportunities;
}

function identifyRisks(businessData, regionalComparison) {
    const risks = [];
    
    if (businessData.saturation > 0.7) {
        risks.push('High market saturation - difficult to differentiate');
    }
    
    if (businessData.localCompetitors.length > 10) {
        risks.push('Many established competitors - challenging to gain market share');
    }
    
    if (businessData.averageRating > 4.5) {
        risks.push('High-quality competitors - difficult to compete on quality alone');
    }
    
    return risks;
}

function generateRecommendations(businessData, regionalComparison) {
    const recommendations = [];
    
    if (businessData.saturation < 0.4) {
        recommendations.push('Focus on rapid market entry and brand building');
    } else {
        recommendations.push('Emphasize unique value propositions and differentiation');
    }
    
    if (businessData.averageRating < 4.0) {
        recommendations.push('Prioritize exceptional customer service and quality');
    }
    
    recommendations.push('Develop strong local partnerships and community connections');
    recommendations.push('Consider mobile or online services to expand reach');
    
    return recommendations;
}

function generateCompetitorName(businessType) {
    const prefixes = ['Elite', 'Premium', 'Pro', 'Express', 'First', 'Best', 'Quality'];
    const suffixes = ['Services', 'Solutions', 'Group', 'Company', 'Inc', 'LLC'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${businessType} ${suffix}`;
}

function generateRandomStrengths() {
    const strengths = ['Excellent customer service', 'Convenient location', 'Competitive pricing', 'Quality products', 'Fast turnaround', 'Experienced staff'];
    return strengths[Math.floor(Math.random() * strengths.length)];
}

function generateRandomWeaknesses() {
    const weaknesses = ['Limited hours', 'High prices', 'Poor customer service', 'Outdated technology', 'Limited selection', 'Inconsistent quality'];
    return weaknesses[Math.floor(Math.random() * weaknesses.length)];
}

function displayAutomatedResearchResults(analysis) {
    try {
        console.log('Displaying analysis:', analysis);
        
        // Calculate average rating from competitors
        const avgRating = analysis.localCompetitors && analysis.localCompetitors.length > 0 
            ? (analysis.localCompetitors.reduce((sum, comp) => sum + (comp.rating || 0), 0) / analysis.localCompetitors.length).toFixed(1)
            : 'N/A';

        // Display market summary
        const researchSummaryEl = document.getElementById('researchSummary');
        if (researchSummaryEl) {
            researchSummaryEl.innerHTML = `
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${analysis.localCompetitors?.length || 0}</span>
                        <span class="stat-label">Local Competitors</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${((analysis.marketSaturation || 0) * 100).toFixed(1)}%</span>
                        <span class="stat-label">Market Saturation</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${avgRating}</span>
                        <span class="stat-label">Avg Competitor Rating</span>
                    </div>
                </div>
                <div class="market-overview">
                    <p><strong>Market Overview:</strong> The ${analysis.businessType || 'business'} market in ${analysis.location || 'your area'} shows ${(analysis.marketSaturation || 0) < 0.4 ? 'low' : (analysis.marketSaturation || 0) < 0.7 ? 'moderate' : 'high'} saturation with ${analysis.localCompetitors?.length || 0} established competitors.</p>
                </div>
            `;
        }

            // Display competition grade
        const competitionGradeEl = document.getElementById('competitionGrade');
        if (competitionGradeEl && analysis.competitionGrade) {
            competitionGradeEl.innerHTML = `
                <div class="grade-display">
                    <div class="grade-letter ${analysis.competitionGrade.grade.toLowerCase()}">${analysis.competitionGrade.grade}</div>
                    <div class="grade-details">
                        <h6>${analysis.competitionGrade.description}</h6>
                        <p>Score: ${analysis.competitionGrade.score}/100</p>
                    </div>
                </div>
            `;
        }

        // Display regional comparison
        const regionalComparisonEl = document.getElementById('regionalComparison');
        if (regionalComparisonEl && analysis.regionalCompetitors) {
            const regionalHTML = Object.entries(analysis.regionalCompetitors.regionalData || {})
                .map(([region, data]) => `
                    <div class="region-item">
                        <strong>${region}:</strong> ${data.competitorCount} competitors, ${(data.saturation * 100).toFixed(1)}% saturation
                    </div>
                `).join('');
            
            regionalComparisonEl.innerHTML = `
                <div class="regional-data">
                    ${regionalHTML}
                </div>
                <p><strong>Analysis:</strong> Your market shows ${(analysis.marketSaturation || 0) < 0.4 ? 'lower' : 'higher'} saturation compared to similar regions, indicating ${(analysis.marketSaturation || 0) < 0.4 ? 'favorable' : 'challenging'} competitive conditions.</p>
            `;
        }

        // Display opportunity analysis
        const opportunityAnalysisEl = document.getElementById('opportunityAnalysis');
        if (opportunityAnalysisEl) {
            opportunityAnalysisEl.innerHTML = `
                <div class="opportunities">
                    <h6>Key Opportunities:</h6>
                    <ul>${(analysis.opportunities || []).map(opp => `<li>${opp}</li>`).join('')}</ul>
                </div>
                <div class="risks">
                    <h6>Potential Risks:</h6>
                    <ul>${(analysis.risks || []).map(risk => `<li>${risk}</li>`).join('')}</ul>
                </div>
                <div class="recommendations">
                    <h6>Strategic Recommendations:</h6>
                    <ul>${(analysis.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}</ul>
                </div>
            `;
        }
         } catch (error) {
         console.error('Error displaying research results:', error);
         alert('Error displaying research results: ' + error.message);
     }
}

function generateMarketingMaterials() {
    const business = localStorage.getItem('currentBusinessType') || 'Business';
    const materials = `
        <div class="name-suggestions">
            <h5>Business Name Suggestions:</h5>
            <ul>
                <li>${business} Pro</li>
                <li>Elite ${business}</li>
                <li>${business} Solutions</li>
                <li>Premium ${business}</li>
                <li>${business} Express</li>
            </ul>
        </div>
        <div class="tagline-suggestions">
            <h5>Tagline Ideas:</h5>
            <ul>
                <li>"Excellence in every service"</li>
                <li>"Your success is our priority"</li>
                <li>"Quality you can trust"</li>
                <li>"Professional results, personal touch"</li>
                <li>"Building your future, one project at a time"</li>
            </ul>
        </div>
        <div class="seo-keywords">
            <h5>SEO Keywords:</h5>
            <ul>
                <li>${business} services</li>
                <li>Professional ${business}</li>
                <li>${business} near me</li>
                <li>Best ${business} company</li>
                <li>${business} experts</li>
            </ul>
        </div>
    `;
    document.getElementById('marketingMaterials').innerHTML = materials;
}

function addCompetitor() {
    const name = document.getElementById('competitorName').value;
    const website = document.getElementById('competitorWebsite').value;
    const location = document.getElementById('competitorLocation').value;
    const pricing = document.getElementById('competitorPricing').value;
    const strengths = document.getElementById('competitorStrengths').value;
    const weaknesses = document.getElementById('competitorWeaknesses').value;
    const targetMarket = document.getElementById('competitorTargetMarket').value;
    
    if (name && location) {
        const competitorsList = document.getElementById('competitorsList');
        const competitorCard = document.createElement('div');
        competitorCard.className = 'competitor-card';
        competitorCard.innerHTML = `
            <h5>${name}</h5>
            ${website ? `<p><strong>Website:</strong> <a href="${website}" target="_blank">${website}</a></p>` : ''}
            <p><strong>Location:</strong> ${location}</p>
            ${pricing ? `<p><strong>Pricing:</strong> ${pricing}</p>` : ''}
            ${targetMarket ? `<p><strong>Target Market:</strong> ${targetMarket}</p>` : ''}
            ${strengths ? `<p><strong>Strengths:</strong> ${strengths}</p>` : ''}
            ${weaknesses ? `<p><strong>Weaknesses:</strong> ${weaknesses}</p>` : ''}
            <button class="btn-secondary" onclick="removeCompetitor(this)" style="margin-top: 10px; font-size: 0.8rem;">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        competitorsList.appendChild(competitorCard);
        
        // Clear form
        document.getElementById('competitorName').value = '';
        document.getElementById('competitorWebsite').value = '';
        document.getElementById('competitorLocation').value = '';
        document.getElementById('competitorPricing').value = '';
        document.getElementById('competitorStrengths').value = '';
        document.getElementById('competitorWeaknesses').value = '';
        document.getElementById('competitorTargetMarket').value = '';
        
        // Generate competitive insights
        generateCompetitiveInsights();
    } else {
        alert('Please provide at least the competitor name and location.');
    }
}

function removeCompetitor(button) {
    button.closest('.competitor-card').remove();
    generateCompetitiveInsights();
}

function generateCompetitiveInsights() {
    const competitorCards = document.querySelectorAll('.competitor-card');
    const insightsDiv = document.getElementById('competitiveInsights');
    const insightsContent = document.getElementById('insightsContent');
    
    if (competitorCards.length === 0) {
        insightsDiv.style.display = 'none';
        return;
    }
    
    // Collect competitor data
    const competitors = [];
    competitorCards.forEach(card => {
        const name = card.querySelector('h5').textContent;
        const location = card.querySelector('p:contains("Location")')?.textContent.replace('Location:', '').trim() || '';
        const pricing = card.querySelector('p:contains("Pricing")')?.textContent.replace('Pricing:', '').trim() || '';
        const strengths = card.querySelector('p:contains("Strengths")')?.textContent.replace('Strengths:', '').trim() || '';
        const weaknesses = card.querySelector('p:contains("Weaknesses")')?.textContent.replace('Weaknesses:', '').trim() || '';
        const targetMarket = card.querySelector('p:contains("Target Market")')?.textContent.replace('Target Market:', '').trim() || '';
        
        competitors.push({ name, location, pricing, strengths, weaknesses, targetMarket });
    });
    
    // Analyze competitors and generate insights
    const insights = analyzeCompetitors(competitors);
    
    insightsContent.innerHTML = insights;
    insightsDiv.style.display = 'block';
}

function analyzeCompetitors(competitors) {
    const businessType = localStorage.getItem('currentBusinessType')?.toLowerCase() || 'business';
    const userLocation = localStorage.getItem('currentLocation') || '';
    
    let insights = '<div class="insights-section">';
    
    // Market positioning analysis
    insights += '<h6><i class="fas fa-bullseye"></i> Market Positioning Analysis</h6>';
    insights += '<ul>';
    
    const pricingRanges = competitors.filter(c => c.pricing).map(c => c.pricing);
    if (pricingRanges.length > 0) {
        insights += '<li><strong>Pricing Landscape:</strong> Competitors range from ' + 
                   pricingRanges.join(' to ') + '. Consider positioning yourself in the mid-range for optimal value perception.</li>';
    }
    
    const locations = competitors.map(c => c.location).filter(l => l);
    if (locations.length > 0) {
        insights += '<li><strong>Geographic Coverage:</strong> Competitors are located in ' + 
                   locations.join(', ') + '. Identify underserved areas or consider mobile services.</li>';
    }
    
    // Strengths analysis
    const allStrengths = competitors.map(c => c.strengths).filter(s => s);
    if (allStrengths.length > 0) {
        insights += '<li><strong>Common Strengths:</strong> ' + 
                   allStrengths.join('; ') + '. Focus on differentiating yourself from these common features.</li>';
    }
    
    insights += '</ul>';
    
    // Weaknesses and opportunities
    insights += '<h6><i class="fas fa-lightbulb"></i> Opportunities & Gaps</h6>';
    insights += '<ul>';
    
    const allWeaknesses = competitors.map(c => c.weaknesses).filter(w => w);
    if (allWeaknesses.length > 0) {
        insights += '<li><strong>Market Gaps:</strong> ' + 
                   allWeaknesses.join('; ') + '. These represent opportunities for your business to excel.</li>';
    }
    
    // Target market analysis
    const targetMarkets = competitors.map(c => c.targetMarket).filter(t => t);
    if (targetMarkets.length > 0) {
        insights += '<li><strong>Target Market Coverage:</strong> Competitors focus on ' + 
                   targetMarkets.join(', ') + '. Consider underserved segments or niche markets.</li>';
    }
    
    insights += '</ul>';
    
    // Strategic recommendations
    insights += '<h6><i class="fas fa-chess"></i> Strategic Recommendations</h6>';
    insights += '<ul>';
    
    if (competitors.length >= 3) {
        insights += '<li><strong>High Competition:</strong> With ' + competitors.length + 
                   ' competitors identified, focus on unique value propositions and exceptional customer service.</li>';
    } else if (competitors.length > 0) {
        insights += '<li><strong>Moderate Competition:</strong> Opportunity exists to establish market presence. Focus on building strong local relationships.</li>';
    }
    
    insights += '<li><strong>Differentiation Strategy:</strong> Emphasize your unique strengths, location advantages, and customer service excellence.</li>';
    insights += '<li><strong>Pricing Strategy:</strong> Position yourself competitively while highlighting value-added services.</li>';
    insights += '<li><strong>Marketing Focus:</strong> Target underserved customer segments and emphasize your local expertise.</li>';
    
    insights += '</ul>';
    
    // Competitive advantages
    insights += '<h6><i class="fas fa-trophy"></i> Your Competitive Advantages</h6>';
    insights += '<ul>';
    insights += '<li><strong>Local Expertise:</strong> Deep knowledge of ' + userLocation + ' market and community needs</li>';
    insights += '<li><strong>Personalized Service:</strong> Ability to provide customized solutions and personal attention</li>';
    insights += '<li><strong>Flexibility:</strong> Quick adaptation to market changes and customer feedback</li>';
    insights += '<li><strong>Community Connection:</strong> Strong local relationships and community involvement</li>';
    insights += '</ul>';
    
    insights += '</div>';
    
    return insights;
}

function calculateFinancials() {
    const startupCosts = parseFloat(document.getElementById('startupCosts').value) || 0;
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
    const expectedRevenue = parseFloat(document.getElementById('expectedRevenue').value) || 0;
    
    const monthlyProfit = expectedRevenue - monthlyExpenses;
    const breakEvenMonths = startupCosts / monthlyProfit;
    const annualProfit = monthlyProfit * 12;
    
    const results = `
        <div class="total-cost">
            <strong>Monthly Profit:</strong> $${monthlyProfit.toFixed(2)}
        </div>
        <div class="total-revenue">
            <strong>Break-even Time:</strong> ${breakEvenMonths.toFixed(1)} months
        </div>
        <div class="total-revenue">
            <strong>Annual Profit:</strong> $${annualProfit.toFixed(2)}
        </div>
    `;
    
    document.getElementById('financialResults').innerHTML = results;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new BusinessPlanGenerator();
    
    // Add event listeners for checkboxes
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const checklistItem = e.target.closest('.checklist-item');
            if (checklistItem) {
                if (e.target.checked) {
                    checklistItem.classList.add('completed');
                } else {
                    checklistItem.classList.remove('completed');
                }
                
                // Update progress bar
                const checklist = checklistItem.closest('.checklist');
                const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
                const checkedBoxes = checklist.querySelectorAll('input[type="checkbox"]:checked');
                const progress = (checkedBoxes.length / checkboxes.length) * 100;
                
                const progressFill = checklist.closest('.market-research-tool').querySelector('.progress-fill');
                progressFill.style.width = progress + '%';
            }
        }
    });
});

// Global functions for business name interactions
function copyBusinessName(name, number) {
    navigator.clipboard.writeText(name).then(() => {
        // Show success feedback
        const nameOption = event.target.closest('.business-name-option');
        const originalContent = nameOption.innerHTML;
        nameOption.innerHTML = `
            <span class="name-number">${number}</span>
            <span class="name-text" style="color: #059669;">✓ Copied!</span>
            <span class="copy-icon"><i class="fas fa-check"></i></span>
        `;
        
        setTimeout(() => {
            nameOption.innerHTML = originalContent;
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = name;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Show feedback
        alert(`Business name "${name}" copied to clipboard!`);
    });
}

function regenerateBusinessNames() {
    const businessType = localStorage.getItem('currentBusinessType') || 'general';
    const location = localStorage.getItem('currentLocation') || 'Local';
    
    const generator = new BusinessPlanGenerator();
    const newNames = generator.generateBusinessNameRecommendations(businessType, location);
    
    const namesGrid = document.querySelector('.business-names-grid');
    if (namesGrid && newNames.length > 0) {
        namesGrid.innerHTML = newNames.map((name, index) => `
            <div class="business-name-option" onclick="copyBusinessName('${name.replace(/'/g, "\\'")}', ${index + 1})" title="Click to copy">
                <span class="name-number">${index + 1}</span>
                <span class="name-text">${name}</span>
                <span class="copy-icon"><i class="fas fa-copy"></i></span>
            </div>
        `).join('');
        
        // Add animation to new names
        document.querySelectorAll('.business-name-option').forEach((option, index) => {
            option.style.opacity = '0';
            option.style.transform = 'translateY(20px)';
            setTimeout(() => {
                option.style.transition = 'all 0.3s ease';
                option.style.opacity = '1';
                option.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

function showNamesHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'names-help-modal';
    helpModal.innerHTML = `
        <div class="names-help-content">
            <h3><i class="fas fa-lightbulb"></i> Business Naming Tips</h3>
            <div class="naming-tips">
                <div class="tip-item">
                    <h4>🎯 Keep it Simple</h4>
                    <p>Choose names that are easy to pronounce, spell, and remember.</p>
                </div>
                <div class="tip-item">
                    <h4>🔍 Check Availability</h4>
                    <p>Verify domain names and business registration availability.</p>
                </div>
                <div class="tip-item">
                    <h4>📱 Consider Social Media</h4>
                    <p>Ensure the name works well as social media handles.</p>
                </div>
                <div class="tip-item">
                    <h4>🌟 Make it Memorable</h4>
                    <p>Use alliteration, rhyme, or unique word combinations.</p>
                </div>
                <div class="tip-item">
                    <h4>🎨 Reflect Your Brand</h4>
                    <p>The name should convey your business personality and values.</p>
                </div>
                <div class="tip-item">
                    <h4>🔮 Think Long-term</h4>
                    <p>Avoid overly trendy names that might feel dated later.</p>
                </div>
            </div>
            <button class="close-help-btn" onclick="closeNamesHelp()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    setTimeout(() => helpModal.classList.add('show'), 10);
}

function closeNamesHelp() {
    const modal = document.querySelector('.names-help-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}
