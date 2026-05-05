"""
Youssef Khamis Al-Assiuty Portfolio
Python Flask Application with Admin Panel
"""

from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, session, flash, abort
import re
import os
import json
import hashlib
import secrets
import sqlite3
from datetime import datetime
from urllib.parse import quote as url_quote
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))

# Custom Jinja2 filters
@app.template_filter('split')
def split_filter(s, delimiter=','):
    if not s:
        return []
    return s.split(delimiter)

@app.template_filter('from_json')
def from_json_filter(s):
    try:
        return json.loads(s) if s else []
    except:
        return []

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'portfolio.db')

# ==========================================
# DATABASE SETUP
# ==========================================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    
    # Site settings table
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )''')
    
    # Projects table
    c.execute('''CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'frontend',
        tags TEXT DEFAULT '[]',
        features TEXT DEFAULT '[]',
        image_url TEXT DEFAULT '',
        live_url TEXT DEFAULT '',
        github_url TEXT DEFAULT '',
        icon TEXT DEFAULT 'fas fa-code',
        gradient TEXT DEFAULT 'gradient-bg-1',
        sort_order INTEGER DEFAULT 0,
        visible INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Certificates table
    c.execute('''CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        provider TEXT,
        provider_icon TEXT DEFAULT '',
        provider_color TEXT DEFAULT '#6366f1',
        date TEXT,
        skills TEXT DEFAULT '[]',
        certificate_url TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        visible INTEGER DEFAULT 1
    )''')
    
    # Contact submissions
    c.execute('''CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT DEFAULT 'quote',
        name TEXT,
        email TEXT,
        service TEXT,
        budget TEXT,
        timeline TEXT,
        message TEXT,
        read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Newsletter subscribers
    c.execute('''CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Testimonials table
    c.execute('''CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        title TEXT,
        text TEXT,
        rating INTEGER DEFAULT 5,
        visible INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0
    )''')
    
    # Admin user
    c.execute('''CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT
    )''')
    
    # Default settings
    defaults = {
        'site_title': 'Youssef Khamis Al-Assiuty | Frontend Developer',
        'hero_title_1': "Hi, I'm",
        'hero_name': 'Youssef Khamis',
        'hero_role': 'Frontend Developer',
        'hero_description': 'Building <span class="highlight">modern</span>, <span class="highlight">scalable</span>, and <span class="highlight">interactive</span> web applications with clean code and user-focused design.',
        'about_lead': 'Frontend Developer focused on building responsive, performant web applications using React, TypeScript, and modern CSS.',
        'about_p1': 'I specialize in turning designs into clean, maintainable code. My focus is on creating intuitive user interfaces that work seamlessly across all devices and browsers.',
        'about_p2': 'I care about code quality, accessibility, and performance. Every project I build follows modern best practices and is optimized for real-world use.',
        'email': 'Yousef.Khames.Elasuoty@gmail.com',
        'location': 'Available Worldwide (Remote)',
        'availability': 'Open for freelance & part-time',
        'facebook_url': 'https://www.facebook.com/yousef.khames.mohamed',
        'instagram_url': 'https://www.instagram.com/yousef_khames_mohamed/',
        'tiktok_url': 'https://www.tiktok.com/@yousef_khames_elasuoty',
        'linkedin_url': 'https://www.linkedin.com/in/yousef-khames-1483153b5/',
        'github_url': '',
        'cv_en_url': '',
        'cv_ar_url': '',
        'calendly_url': '',
        'stat_years': '3',
        'stat_projects': '0',
        'stat_clients': '0',
        'show_stats': '0',
        'show_testimonials': '0',
        'show_fun_facts': '0',
        'footer_year': '2026',
        'site_version': 'v1.0',
        'last_updated': datetime.now().strftime('%B %Y'),
    }
    
    for key, value in defaults.items():
        c.execute('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', (key, value))
    
    # Default admin (change password on first login!)
    default_pass = hashlib.sha256('admin123'.encode()).hexdigest()
    c.execute('INSERT OR IGNORE INTO admin (id, username, password_hash) VALUES (1, ?, ?)', ('admin', default_pass))
    
    # Default projects (visible but marked as concept)
    projects_exist = c.execute('SELECT COUNT(*) FROM projects').fetchone()[0]
    if projects_exist == 0:
        sample_projects = [
            ('Modern Dashboard UI', 'A sleek admin dashboard with data visualization and dark mode.', 'frontend', '["React","TypeScript","Tailwind"]', '["Real-time data visualization","Dark/Light mode toggle","Responsive design","Interactive charts"]', '', '', '', 'fas fa-palette', 'gradient-bg-1', 1, 1),
            ('E-Commerce Platform', 'Full-stack e-commerce with cart, payments & inventory.', 'fullstack', '["Next.js","Node.js","MongoDB"]', '["Product catalog","Shopping cart","Payment integration","Order tracking"]', '', '', '', 'fas fa-shopping-cart', 'gradient-bg-2', 2, 1),
            ('Mobile App Concept', 'Fitness tracking app with gamification features.', 'ui', '["Figma","UI Design","Prototyping"]', '["Gamified tracking","Social challenges","Progress visualization","Personalized workouts"]', '', '', '', 'fas fa-mobile-alt', 'gradient-bg-3', 3, 1),
        ]
        for p in sample_projects:
            c.execute('''INSERT INTO projects (title, description, category, tags, features, image_url, live_url, github_url, icon, gradient, sort_order, visible) 
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''', p)
    
    # Default certificates
    certs_exist = c.execute('SELECT COUNT(*) FROM certificates').fetchone()[0]
    if certs_exist == 0:
        sample_certs = [
            ('Meta Front-End Developer', 'Meta (Facebook)', 'fab fa-react', '#61DAFB', '2024', '["React","JavaScript","CSS"]', '', 1, 1),
            ('Google UX Design Professional', 'Google', 'fab fa-google', '#4285F4', '2024', '["UX Design","Figma","Prototyping"]', '', 2, 1),
            ('JavaScript Algorithms & Data Structures', 'freeCodeCamp', 'fab fa-js-square', '#F7DF1E', '2023', '["JavaScript","Algorithms","ES6+"]', '', 3, 1),
            ('Azure Fundamentals (AZ-900)', 'Microsoft', 'fab fa-microsoft', '#00A4EF', '2024', '["Cloud","Azure","DevOps"]', '', 4, 1),
        ]
        for cert in sample_certs:
            c.execute('''INSERT INTO certificates (title, provider, provider_icon, provider_color, date, skills, certificate_url, sort_order, visible) 
                        VALUES (?,?,?,?,?,?,?,?,?)''', cert)
    
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

# ==========================================
# HELPERS
# ==========================================
def sanitize_input(input_str):
    if not isinstance(input_str, str):
        return ''
    result = input_str
    result = re.sub(r'[<>]', '', result)
    result = re.sub(r'javascript:', '', result, flags=re.IGNORECASE)
    result = re.sub(r'on\w+=', '', result, flags=re.IGNORECASE)
    return result.strip()[:2000]

def is_valid_email(email):
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email)) and len(email) <= 254

def get_settings():
    conn = get_db()
    rows = conn.execute('SELECT key, value FROM settings').fetchall()
    conn.close()
    return {row['key']: row['value'] for row in rows}

def get_setting(key, default=''):
    conn = get_db()
    row = conn.execute('SELECT value FROM settings WHERE key = ?', (key,)).fetchone()
    conn.close()
    return row['value'] if row else default

def set_setting(key, value):
    conn = get_db()
    conn.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (key, str(value)))
    conn.commit()
    conn.close()

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated

# Rate limiting (simple in-memory)
_rate_limits = {}

def check_rate_limit(ip, action, max_requests=5, window=60):
    key = f"{ip}:{action}"
    now = datetime.now().timestamp()
    if key not in _rate_limits:
        _rate_limits[key] = []
    _rate_limits[key] = [t for t in _rate_limits[key] if now - t < window]
    if len(_rate_limits[key]) >= max_requests:
        return False
    _rate_limits[key].append(now)
    return True

# ==========================================
# SECURITY HEADERS
# ==========================================
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; connect-src 'self'; frame-ancestors 'none';"
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# ==========================================
# SVG FAVICON
# ==========================================
FAVICON_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="50%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#grad)"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="white">YK</text>
</svg>'''
FAVICON_DATA_URI = f"data:image/svg+xml,{url_quote(FAVICON_SVG)}"

# ==========================================
# PUBLIC ROUTES
# ==========================================
@app.route('/')
def index():
    settings = get_settings()
    conn = get_db()
    projects = conn.execute('SELECT * FROM projects WHERE visible = 1 ORDER BY sort_order').fetchall()
    certificates = conn.execute('SELECT * FROM certificates WHERE visible = 1 ORDER BY sort_order').fetchall()
    testimonials = conn.execute('SELECT * FROM testimonials WHERE visible = 1 ORDER BY sort_order').fetchall()
    conn.close()
    
    return render_template('index.html',
        settings=settings,
        projects=[dict(p) for p in projects],
        certificates=[dict(c) for c in certificates],
        testimonials=[dict(t) for t in testimonials],
        favicon_uri=FAVICON_DATA_URI)

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt', mimetype='text/plain')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')

# ==========================================
# API ROUTES (with rate limiting)
# ==========================================
@app.route('/api/quote', methods=['POST'])
def quote_request():
    if not check_rate_limit(request.remote_addr, 'quote', 3, 300):
        return jsonify({'success': False, 'message': 'Too many requests. Please try again later.'}), 429
    try:
        data = request.get_json()
        name = sanitize_input(data.get('name', ''))
        email = sanitize_input(data.get('email', ''))
        service = sanitize_input(data.get('service', ''))
        budget = sanitize_input(data.get('budget', ''))
        timeline = sanitize_input(data.get('timeline', ''))
        message = sanitize_input(data.get('message', ''))
        
        if not all([name, email, service, budget, timeline, message]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email address'}), 400
        
        conn = get_db()
        conn.execute('''INSERT INTO messages (type, name, email, service, budget, timeline, message) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)''', ('quote', name, email, service, budget, timeline, message))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': "Thank you! Your quote request has been received. I'll get back to you within 24 hours."})
    except:
        return jsonify({'success': False, 'message': 'Error processing request'}), 400

@app.route('/api/newsletter', methods=['POST'])
def newsletter_subscribe():
    if not check_rate_limit(request.remote_addr, 'newsletter', 3, 300):
        return jsonify({'success': False, 'message': 'Too many requests.'}), 429
    try:
        data = request.get_json()
        email = sanitize_input(data.get('email', ''))
        if not email or not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Please provide a valid email address'}), 400
        
        conn = get_db()
        try:
            conn.execute('INSERT INTO subscribers (email) VALUES (?)', (email,))
            conn.commit()
        except sqlite3.IntegrityError:
            pass  # Already subscribed
        conn.close()
        
        return jsonify({'success': True, 'message': "Successfully subscribed!"})
    except:
        return jsonify({'success': False, 'message': 'Error processing subscription'}), 400

@app.route('/api/contact', methods=['POST'])
def contact_form():
    if not check_rate_limit(request.remote_addr, 'contact', 3, 300):
        return jsonify({'success': False, 'message': 'Too many requests.'}), 429
    try:
        data = request.get_json()
        name = sanitize_input(data.get('name', ''))
        email = sanitize_input(data.get('email', ''))
        message = sanitize_input(data.get('message', ''))
        
        if not all([name, email, message]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email address'}), 400
        
        conn = get_db()
        conn.execute('''INSERT INTO messages (type, name, email, message) VALUES (?, ?, ?, ?)''', ('contact', name, email, message))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': "Message sent successfully! I'll respond within 24 hours."})
    except:
        return jsonify({'success': False, 'message': 'Error sending message'}), 400

# ==========================================
# CUSTOM 404
# ==========================================
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', favicon_uri=FAVICON_DATA_URI), 404

# ==========================================
# ADMIN ROUTES
# ==========================================
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        conn = get_db()
        admin = conn.execute('SELECT * FROM admin WHERE username = ? AND password_hash = ?', (username, password_hash)).fetchone()
        conn.close()
        
        if admin:
            session['admin_logged_in'] = True
            session['admin_username'] = username
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials', 'error')
    
    return render_template('admin/login.html', favicon_uri=FAVICON_DATA_URI)

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin_dashboard():
    conn = get_db()
    msg_count = conn.execute('SELECT COUNT(*) FROM messages WHERE read = 0').fetchone()[0]
    total_msgs = conn.execute('SELECT COUNT(*) FROM messages').fetchone()[0]
    sub_count = conn.execute('SELECT COUNT(*) FROM subscribers').fetchone()[0]
    proj_count = conn.execute('SELECT COUNT(*) FROM projects').fetchone()[0]
    cert_count = conn.execute('SELECT COUNT(*) FROM certificates').fetchone()[0]
    conn.close()
    
    return render_template('admin/dashboard.html',
        msg_count=msg_count, total_msgs=total_msgs,
        sub_count=sub_count, proj_count=proj_count, cert_count=cert_count,
        favicon_uri=FAVICON_DATA_URI)

# --- Settings ---
@app.route('/admin/settings', methods=['GET', 'POST'])
@login_required
def admin_settings():
    if request.method == 'POST':
        for key in request.form:
            if key != 'csrf_token':
                set_setting(key, request.form[key])
        # Handle checkboxes (they don't send when unchecked)
        for checkbox in ['show_stats', 'show_testimonials', 'show_fun_facts']:
            if checkbox not in request.form:
                set_setting(checkbox, '0')
        set_setting('last_updated', datetime.now().strftime('%B %Y'))
        flash('Settings saved!', 'success')
        return redirect(url_for('admin_settings'))
    
    settings = get_settings()
    return render_template('admin/settings.html', settings=settings, favicon_uri=FAVICON_DATA_URI)

# --- Change Password ---
@app.route('/admin/password', methods=['POST'])
@login_required
def admin_change_password():
    old_pw = request.form.get('old_password', '')
    new_pw = request.form.get('new_password', '')
    confirm_pw = request.form.get('confirm_password', '')
    
    if new_pw != confirm_pw:
        flash('Passwords do not match', 'error')
        return redirect(url_for('admin_settings'))
    if len(new_pw) < 6:
        flash('Password must be at least 6 characters', 'error')
        return redirect(url_for('admin_settings'))
    
    old_hash = hashlib.sha256(old_pw.encode()).hexdigest()
    conn = get_db()
    admin = conn.execute('SELECT * FROM admin WHERE password_hash = ?', (old_hash,)).fetchone()
    if not admin:
        flash('Current password is incorrect', 'error')
        conn.close()
        return redirect(url_for('admin_settings'))
    
    new_hash = hashlib.sha256(new_pw.encode()).hexdigest()
    conn.execute('UPDATE admin SET password_hash = ? WHERE id = 1', (new_hash,))
    conn.commit()
    conn.close()
    flash('Password changed successfully!', 'success')
    return redirect(url_for('admin_settings'))

# --- Projects CRUD ---
@app.route('/admin/projects')
@login_required
def admin_projects():
    conn = get_db()
    projects = conn.execute('SELECT * FROM projects ORDER BY sort_order').fetchall()
    conn.close()
    return render_template('admin/projects.html', projects=[dict(p) for p in projects], favicon_uri=FAVICON_DATA_URI)

@app.route('/admin/projects/add', methods=['POST'])
@login_required
def admin_add_project():
    conn = get_db()
    tags = json.dumps([t.strip() for t in request.form.get('tags', '').split(',') if t.strip()])
    features = json.dumps([f.strip() for f in request.form.get('features', '').split('\n') if f.strip()])
    conn.execute('''INSERT INTO projects (title, description, category, tags, features, image_url, live_url, github_url, icon, gradient, sort_order, visible)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''', (
        request.form.get('title', ''),
        request.form.get('description', ''),
        request.form.get('category', 'frontend'),
        tags, features,
        request.form.get('image_url', ''),
        request.form.get('live_url', ''),
        request.form.get('github_url', ''),
        request.form.get('icon', 'fas fa-code'),
        request.form.get('gradient', 'gradient-bg-1'),
        int(request.form.get('sort_order', 0)),
        1 if request.form.get('visible') else 0
    ))
    conn.commit()
    conn.close()
    flash('Project added!', 'success')
    return redirect(url_for('admin_projects'))

@app.route('/admin/projects/edit/<int:pid>', methods=['POST'])
@login_required
def admin_edit_project(pid):
    conn = get_db()
    tags = json.dumps([t.strip() for t in request.form.get('tags', '').split(',') if t.strip()])
    features = json.dumps([f.strip() for f in request.form.get('features', '').split('\n') if f.strip()])
    conn.execute('''UPDATE projects SET title=?, description=?, category=?, tags=?, features=?, image_url=?, live_url=?, github_url=?, icon=?, gradient=?, sort_order=?, visible=? WHERE id=?''', (
        request.form.get('title', ''),
        request.form.get('description', ''),
        request.form.get('category', 'frontend'),
        tags, features,
        request.form.get('image_url', ''),
        request.form.get('live_url', ''),
        request.form.get('github_url', ''),
        request.form.get('icon', 'fas fa-code'),
        request.form.get('gradient', 'gradient-bg-1'),
        int(request.form.get('sort_order', 0)),
        1 if request.form.get('visible') else 0,
        pid
    ))
    conn.commit()
    conn.close()
    flash('Project updated!', 'success')
    return redirect(url_for('admin_projects'))

@app.route('/admin/projects/delete/<int:pid>', methods=['POST'])
@login_required
def admin_delete_project(pid):
    conn = get_db()
    conn.execute('DELETE FROM projects WHERE id = ?', (pid,))
    conn.commit()
    conn.close()
    flash('Project deleted!', 'success')
    return redirect(url_for('admin_projects'))

# --- Certificates CRUD ---
@app.route('/admin/certificates')
@login_required
def admin_certificates():
    conn = get_db()
    certs = conn.execute('SELECT * FROM certificates ORDER BY sort_order').fetchall()
    conn.close()
    return render_template('admin/certificates.html', certificates=[dict(c) for c in certs], favicon_uri=FAVICON_DATA_URI)

@app.route('/admin/certificates/add', methods=['POST'])
@login_required
def admin_add_certificate():
    conn = get_db()
    skills = json.dumps([s.strip() for s in request.form.get('skills', '').split(',') if s.strip()])
    conn.execute('''INSERT INTO certificates (title, provider, provider_icon, provider_color, date, skills, certificate_url, sort_order, visible)
                   VALUES (?,?,?,?,?,?,?,?,?)''', (
        request.form.get('title', ''),
        request.form.get('provider', ''),
        request.form.get('provider_icon', ''),
        request.form.get('provider_color', '#6366f1'),
        request.form.get('date', ''),
        skills,
        request.form.get('certificate_url', ''),
        int(request.form.get('sort_order', 0)),
        1 if request.form.get('visible') else 0
    ))
    conn.commit()
    conn.close()
    flash('Certificate added!', 'success')
    return redirect(url_for('admin_certificates'))

@app.route('/admin/certificates/edit/<int:cid>', methods=['POST'])
@login_required
def admin_edit_certificate(cid):
    conn = get_db()
    skills = json.dumps([s.strip() for s in request.form.get('skills', '').split(',') if s.strip()])
    conn.execute('''UPDATE certificates SET title=?, provider=?, provider_icon=?, provider_color=?, date=?, skills=?, certificate_url=?, sort_order=?, visible=? WHERE id=?''', (
        request.form.get('title', ''),
        request.form.get('provider', ''),
        request.form.get('provider_icon', ''),
        request.form.get('provider_color', '#6366f1'),
        request.form.get('date', ''),
        skills,
        request.form.get('certificate_url', ''),
        int(request.form.get('sort_order', 0)),
        1 if request.form.get('visible') else 0,
        cid
    ))
    conn.commit()
    conn.close()
    flash('Certificate updated!', 'success')
    return redirect(url_for('admin_certificates'))

@app.route('/admin/certificates/delete/<int:cid>', methods=['POST'])
@login_required
def admin_delete_certificate(cid):
    conn = get_db()
    conn.execute('DELETE FROM certificates WHERE id = ?', (cid,))
    conn.commit()
    conn.close()
    flash('Certificate deleted!', 'success')
    return redirect(url_for('admin_certificates'))

# --- Messages ---
@app.route('/admin/messages')
@login_required
def admin_messages():
    conn = get_db()
    messages = conn.execute('SELECT * FROM messages ORDER BY created_at DESC').fetchall()
    conn.execute('UPDATE messages SET read = 1 WHERE read = 0')
    conn.commit()
    conn.close()
    return render_template('admin/messages.html', messages=[dict(m) for m in messages], favicon_uri=FAVICON_DATA_URI)

@app.route('/admin/messages/delete/<int:mid>', methods=['POST'])
@login_required
def admin_delete_message(mid):
    conn = get_db()
    conn.execute('DELETE FROM messages WHERE id = ?', (mid,))
    conn.commit()
    conn.close()
    flash('Message deleted!', 'success')
    return redirect(url_for('admin_messages'))

# --- Subscribers ---
@app.route('/admin/subscribers')
@login_required
def admin_subscribers():
    conn = get_db()
    subs = conn.execute('SELECT * FROM subscribers ORDER BY created_at DESC').fetchall()
    conn.close()
    return render_template('admin/subscribers.html', subscribers=[dict(s) for s in subs], favicon_uri=FAVICON_DATA_URI)

# --- Testimonials CRUD ---
@app.route('/admin/testimonials')
@login_required
def admin_testimonials():
    conn = get_db()
    testimonials = conn.execute('SELECT * FROM testimonials ORDER BY sort_order').fetchall()
    conn.close()
    return render_template('admin/testimonials.html', testimonials=[dict(t) for t in testimonials], favicon_uri=FAVICON_DATA_URI)

@app.route('/admin/testimonials/add', methods=['POST'])
@login_required
def admin_add_testimonial():
    conn = get_db()
    conn.execute('''INSERT INTO testimonials (name, title, text, rating, visible, sort_order) VALUES (?,?,?,?,?,?)''', (
        request.form.get('name', ''),
        request.form.get('title', ''),
        request.form.get('text', ''),
        int(request.form.get('rating', 5)),
        1 if request.form.get('visible') else 0,
        int(request.form.get('sort_order', 0))
    ))
    conn.commit()
    conn.close()
    flash('Testimonial added!', 'success')
    return redirect(url_for('admin_testimonials'))

@app.route('/admin/testimonials/edit/<int:tid>', methods=['POST'])
@login_required
def admin_edit_testimonial(tid):
    conn = get_db()
    conn.execute('''UPDATE testimonials SET name=?, title=?, text=?, rating=?, visible=?, sort_order=? WHERE id=?''', (
        request.form.get('name', ''),
        request.form.get('title', ''),
        request.form.get('text', ''),
        int(request.form.get('rating', 5)),
        1 if request.form.get('visible') else 0,
        int(request.form.get('sort_order', 0)),
        tid
    ))
    conn.commit()
    conn.close()
    flash('Testimonial updated!', 'success')
    return redirect(url_for('admin_testimonials'))

@app.route('/admin/testimonials/delete/<int:tid>', methods=['POST'])
@login_required
def admin_delete_testimonial(tid):
    conn = get_db()
    conn.execute('DELETE FROM testimonials WHERE id = ?', (tid,))
    conn.commit()
    conn.close()
    flash('Testimonial deleted!', 'success')
    return redirect(url_for('admin_testimonials'))

# ==========================================
# FILE UPLOAD for CV / Project images
# ==========================================
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/admin/upload', methods=['POST'])
@login_required
def admin_upload():
    if 'file' not in request.files:
        flash('No file selected', 'error')
        return redirect(request.referrer or url_for('admin_dashboard'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected', 'error')
        return redirect(request.referrer or url_for('admin_dashboard'))
    
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{secrets.token_hex(8)}.{ext}"
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        flash(f'File uploaded: /static/uploads/{filename}', 'success')
        
        # If uploading CV, update setting
        purpose = request.form.get('purpose', '')
        if purpose == 'cv_en':
            set_setting('cv_en_url', f'/static/uploads/{filename}')
        elif purpose == 'cv_ar':
            set_setting('cv_ar_url', f'/static/uploads/{filename}')
    else:
        flash('Invalid file type', 'error')
    
    return redirect(request.referrer or url_for('admin_dashboard'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
