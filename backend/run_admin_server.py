#!/usr/bin/env python
"""
Script to run admin backend on a different port (8001)
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
    django.setup()
    execute_from_command_line(['manage.py', 'runserver', '8001'])


