
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from admin_app.models import NGOOrganization, NGOCampaign
from django.utils import timezone

def seed_ngo_data():
    print("Checking NGO Data...")
    if NGOOrganization.objects.count() > 0:
        print("NGO data already exists. Skipping seed.")
        return

    print("Seeding NGO Data...")
    
    # 1. Education for All
    ngo1 = NGOOrganization.objects.create(
        name='Education for All',
        description='Providing quality education to underprivileged children across India',
        location='Mumbai, India',
        founded=2010,
        website='https://educationforall.org',
        contact_email='contact@educationforall.org',
        impact='Educated 50,000+ children',
        image_url='https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo1, name='Rural School Development', description='Building schools', target_amount=500000, raised_amount=120000)
    NGOCampaign.objects.create(ngo=ngo1, name='Digital Learning Initiative', description='Tablets for kids', target_amount=300000, raised_amount=50000)

    # 2. Food for Hunger
    ngo2 = NGOOrganization.objects.create(
        name='Food for Hunger',
        description='Fighting hunger and malnutrition',
        location='Delhi, India',
        founded=2008,
        website='https://foodforhunger.org',
        contact_email='info@foodforhunger.org',
        impact='Served 100,000+ meals',
        image_url='https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo2, name='Daily Meal Program', description='Nutritious meals', target_amount=400000, raised_amount=250000)

    # 3. Healthcare for All
    ngo3 = NGOOrganization.objects.create(
        name='Healthcare for All',
        description='Bringing healthcare services to remote areas',
        location='Bangalore, India',
        founded=2012,
        website='https://healthcareforall.org',
        contact_email='support@healthcareforall.org',
        impact='Treated 75,000+ patients',
        image_url='https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo3, name='Mobile Medical Camps', description='Medical camps in remote areas', target_amount=600000, raised_amount=420000)

    # 4. Child Welfare Society
    ngo4 = NGOOrganization.objects.create(
        name='Child Welfare Society',
        description='Protecting and nurturing children in need across India',
        location='Chennai, India',
        founded=2015,
        website='https://childwelfare.org',
        contact_email='help@childwelfare.org',
        impact='Helped 25,000+ children',
        image_url='/images/child.webp',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo4, name='Orphanage Support', description='Providing food and education to orphans', target_amount=450000, raised_amount=320000)

    # 5. Rural Education Initiative
    ngo5 = NGOOrganization.objects.create(
        name='Rural Education Initiative',
        description='Bringing quality education to rural and tribal areas',
        location='Kolkata, India',
        founded=2009,
        website='https://ruraleducation.org',
        contact_email='learn@ruraleducation.org',
        impact='Educated 40,000+ rural children',
        image_url='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo5, name='Mobile Libraries', description='Bringing books to remote villages', target_amount=550000, raised_amount=400000)

    # 6. Animal Welfare Society
    ngo6 = NGOOrganization.objects.create(
        name='Animal Welfare Society',
        description='Protecting and caring for stray animals',
        location='Pune, India',
        founded=2011,
        website='https://animalwelfare.org',
        contact_email='care@animalwelfare.org',
        impact='Rescued 15,000+ animals',
        image_url='https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo6, name='Sterilization Drive', description='Controlling animal population', target_amount=300000, raised_amount=220000)

    # 7. Disaster Relief Fund
    ngo7 = NGOOrganization.objects.create(
        name='Disaster Relief Fund',
        description='Providing immediate aid during natural disasters',
        location='Hyderabad, India',
        founded=2013,
        website='https://disasterrelief.org',
        contact_email='relief@disasterrelief.org',
        impact='Helped 50,000+ affected people',
        image_url='/images/global.jpg',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo7, name='Flood Response', description='Aid for flood victims', target_amount=800000, raised_amount=600000)

    # 8. Elder Care Foundation
    ngo8 = NGOOrganization.objects.create(
        name='Elder Care Foundation',
        description='Supporting elderly citizens with care and companionship',
        location='Ahmedabad, India',
        founded=2007,
        website='https://eldercare.org',
        contact_email='support@eldercare.org',
        impact='Cared for 20,000+ elders',
        image_url='/images/elder.jpg',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo8, name='Home Care Services', description='In-home care', target_amount=400000, raised_amount=300000)

    # 9. Children's Education Trust
    ngo9 = NGOOrganization.objects.create(
        name="Children's Education Trust",
        description='Focusing on holistic development of underprivileged children',
        location='Jaipur, India',
        founded=2014,
        website='https://childreneducation.org',
        contact_email='grow@childreneducation.org',
        impact='Nurtured 35,000+ children',
        image_url='https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo9, name='After School Programs', description='Extra-curricular activities for kids', target_amount=250000, raised_amount=180000)

    # 10. Old Age Homes Network
    ngo10 = NGOOrganization.objects.create(
        name='Old Age Homes Network',
        description='Providing dignified living for senior citizens',
        location='Varanasi, India',
        founded=2006,
        website='https://oldagehomes.org',
        contact_email='care@oldagehomes.org',
        impact='Sheltered 15,000+ seniors',
        image_url='/images/old.jpg',
        status='approved',
        is_active=True,
        approved_date=timezone.now()
    )
    NGOCampaign.objects.create(ngo=ngo10, name='Senior Living Facilities', description='Building comfortable homes for elders', target_amount=900000, raised_amount=650000)

    print("Seeded 10 NGOs and multiple Campaigns.")

if __name__ == '__main__':
    seed_ngo_data()
