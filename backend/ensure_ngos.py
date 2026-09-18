import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from admin_app.models import NGOOrganization, NGOCampaign
from django.utils import timezone

NGOS = [
    {
        'name': 'Education for All',
        'description': 'Providing quality education to underprivileged children across India',
        'location': 'Mumbai, India',
        'founded': 2010,
        'website': 'https://educationforall.org',
        'contact_email': 'contact@educationforall.org',
        'impact': 'Educated 50,000+ children',
        'image_url': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
        'campaigns': [
            {'name': 'Rural School Development', 'description': 'Building schools in rural areas', 'target': 500000, 'raised': 350000},
            {'name': 'Digital Learning Initiative', 'description': 'Providing tablets and online resources', 'target': 300000, 'raised': 180000},
        ]
    },
    {
        'name': 'Food for Hunger',
        'description': 'Fighting hunger and malnutrition in rural communities',
        'location': 'Delhi, India',
        'founded': 2008,
        'website': 'https://foodforhunger.org',
        'contact_email': 'info@foodforhunger.org',
        'impact': 'Served 100,000+ meals',
        'image_url': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
        'campaigns': [
            {'name': 'Daily Meal Program', 'description': 'Providing nutritious meals to children', 'target': 400000, 'raised': 280000},
        ]
    },
    {
        'name': 'Healthcare for All',
        'description': 'Bringing healthcare services to remote areas',
        'location': 'Bangalore, India',
        'founded': 2012,
        'website': 'https://healthcareforall.org',
        'contact_email': 'support@healthcareforall.org',
        'impact': 'Treated 75,000+ patients',
        'image_url': 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400',
        'campaigns': [
            {'name': 'Mobile Medical Camps', 'description': 'Setting up camps in underserved areas', 'target': 600000, 'raised': 420000},
        ]
    },
    {
        'name': 'Child Welfare Society',
        'description': 'Protecting and nurturing children in need across India',
        'location': 'Chennai, India',
        'founded': 2015,
        'website': 'https://childwelfare.org',
        'contact_email': 'help@childwelfare.org',
        'impact': 'Helped 25,000+ children',
        'image_url': '/images/child.webp',
        'campaigns': [
            {'name': 'Orphanage Support', 'description': 'Providing food and education to orphans', 'target': 450000, 'raised': 320000},
            {'name': 'Child Health Program', 'description': 'Medical care for underprivileged children', 'target': 350000, 'raised': 250000},
        ]
    },
    {
        'name': 'Rural Education Initiative',
        'description': 'Bringing quality education to rural and tribal areas',
        'location': 'Kolkata, India',
        'founded': 2009,
        'website': 'https://ruraleducation.org',
        'contact_email': 'learn@ruraleducation.org',
        'impact': 'Educated 40,000+ rural children',
        'image_url': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        'campaigns': [
            {'name': 'Mobile Libraries', 'description': 'Bringing books to remote villages', 'target': 550000, 'raised': 400000},
        ]
    },
    {
        'name': 'Animal Welfare Society',
        'description': 'Protecting and caring for stray animals',
        'location': 'Pune, India',
        'founded': 2011,
        'website': 'https://animalwelfare.org',
        'contact_email': 'care@animalwelfare.org',
        'impact': 'Rescued 15,000+ animals',
        'image_url': 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
        'campaigns': [
            {'name': 'Sterilization Drive', 'description': 'Controlling animal population', 'target': 300000, 'raised': 220000},
            {'name': 'Shelter Construction', 'description': 'Building shelters for animals', 'target': 700000, 'raised': 500000},
        ]
    },
    {
        'name': 'Disaster Relief Fund',
        'description': 'Providing immediate aid during natural disasters',
        'location': 'Hyderabad, India',
        'founded': 2013,
        'website': 'https://disasterrelief.org',
        'contact_email': 'relief@disasterrelief.org',
        'impact': 'Helped 50,000+ affected people',
        'image_url': '/images/global.jpg',
        'campaigns': [
            {'name': 'Flood Response', 'description': 'Aid for flood victims', 'target': 800000, 'raised': 600000},
        ]
    },
    {
        'name': 'Elder Care Foundation',
        'description': 'Supporting elderly citizens with care and companionship',
        'location': 'Ahmedabad, India',
        'founded': 2007,
        'website': 'https://eldercare.org',
        'contact_email': 'support@eldercare.org',
        'impact': 'Cared for 20,000+ elders',
        'image_url': '/images/elder.jpg',
        'campaigns': [
            {'name': 'Home Care Services', 'description': 'Providing in-home care', 'target': 400000, 'raised': 300000},
            {'name': 'Senior Centers', 'description': 'Building community centers', 'target': 600000, 'raised': 450000},
        ]
    },
    {
        'name': "Children's Education Trust",
        'description': 'Focusing on holistic development of underprivileged children',
        'location': 'Jaipur, India',
        'founded': 2014,
        'website': 'https://childreneducation.org',
        'contact_email': 'grow@childreneducation.org',
        'impact': 'Nurtured 35,000+ children',
        'image_url': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
        'campaigns': [
            {'name': 'After School Programs', 'description': 'Extra-curricular activities for kids', 'target': 250000, 'raised': 180000},
        ]
    },
    {
        'name': 'Old Age Homes Network',
        'description': 'Providing dignified living for senior citizens',
        'location': 'Varanasi, India',
        'founded': 2006,
        'website': 'https://oldagehomes.org',
        'contact_email': 'care@oldagehomes.org',
        'impact': 'Sheltered 15,000+ seniors',
        'image_url': '/images/old.jpg',
        'campaigns': [
            {'name': 'Senior Living Facilities', 'description': 'Building comfortable homes for elders', 'target': 900000, 'raised': 650000},
            {'name': 'Medical Care for Elders', 'description': 'Healthcare services for seniors', 'target': 350000, 'raised': 270000},
        ]
    },
]


def ensure_ngos():
    created = 0
    for ngo_def in NGOS:
        ngo, was_created = NGOOrganization.objects.get_or_create(name=ngo_def['name'], defaults={
            'description': ngo_def['description'],
            'location': ngo_def['location'],
            'founded': ngo_def.get('founded'),
            'website': ngo_def.get('website'),
            'contact_email': ngo_def.get('contact_email') or 'info@example.org',
            'impact': ngo_def.get('impact'),
            'image_url': ngo_def.get('image_url'),
            'status': 'approved',
            'is_active': True,
            'approved_date': timezone.now()
        })
        if was_created:
            created += 1
            print(f"Created NGO: {ngo.name}")
        else:
            # Update fields if missing or blank
            changed = False
            for field in ['description','location','founded','website','contact_email','impact','image_url']:
                val = ngo_def.get(field)
                if val and (not getattr(ngo, field)):
                    setattr(ngo, field, val)
                    changed = True
            if changed:
                ngo.save()
                print(f"Updated NGO: {ngo.name}")

        # Ensure campaigns
        for camp in ngo_def.get('campaigns', []):
            campaign_obj, camp_created = NGOCampaign.objects.get_or_create(ngo=ngo, name=camp['name'], defaults={
                'description': camp.get('description',''),
                'target_amount': camp.get('target', 0),
                'raised_amount': camp.get('raised', 0),
                'start_date': timezone.now(),
                'is_active': True
            })
            if camp_created:
                print(f"  Created campaign: {campaign_obj.name} for NGO {ngo.name}")
            else:
                # update amounts if necessary
                updated = False
                if campaign_obj.target_amount == 0 and camp.get('target'):
                    campaign_obj.target_amount = camp['target']
                    updated = True
                if campaign_obj.raised_amount == 0 and camp.get('raised'):
                    campaign_obj.raised_amount = camp['raised']
                    updated = True
                if updated:
                    campaign_obj.save()
                    print(f"  Updated campaign amounts: {campaign_obj.name}")

    print(f"Ensure completed. Created {created} new NGOs (or updated existing ones).")

if __name__ == '__main__':
    ensure_ngos()
