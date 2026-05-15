import os
import re

directory = "c:/Users/mhari/OneDrive/Desktop/mini_project_college/frontend/src"

replacements = [
    (r"color:\s*['\"]#1e293b['\"]", "color: '#e2e8f0'"),
    (r"color:\s*['\"]#64748b['\"]", "color: 'rgba(255, 255, 255, 0.5)'"),
    (r"color:\s*['\"]#475569['\"]", "color: 'rgba(255, 255, 255, 0.7)'"),
    (r"background:\s*['\"]#f1f5f9['\"]", "background: 'rgba(255, 255, 255, 0.1)'"),
    (r"background:\s*['\"]#ffffff['\"]", "background: 'rgba(255, 255, 255, 0.05)'"),
    (r"border:\s*['\"]1px solid #e2e8f0['\"]", "border: '1px solid rgba(255, 255, 255, 0.1)'"),
    (r"border:\s*['\"]1px solid #cbd5e1['\"]", "border: '1px solid rgba(255, 255, 255, 0.2)'"),
    (r"background:\s*['\"]#eff6ff['\"]", "background: 'rgba(108, 99, 255, 0.1)'"),
    (r"border:\s*['\"]1px solid #bfdbfe['\"]", "border: '1px solid rgba(108, 99, 255, 0.2)'"),
    (r"background:\s*['\"]#fee2e2['\"]", "background: 'rgba(239, 68, 68, 0.15)'"),
    (r"border:\s*['\"]1px solid #fecaca['\"]", "border: '1px solid rgba(239, 68, 68, 0.3)'"),
    (r"color:\s*['\"]#ef4444['\"]", "color: '#fc8181'"),
    (r"background:\s*['\"]#dcfce3['\"]", "background: 'rgba(74, 222, 128, 0.15)'"),
    (r"border:\s*['\"]1px solid #bbf7d0['\"]", "border: '1px solid rgba(74, 222, 128, 0.3)'"),
    (r"color:\s*['\"]#16a34a['\"]", "color: '#4ade80'"),
    (r"color:\s*['\"]#4338ca['\"]", "color: '#a5b4fc'"),
    (r"color:\s*['\"]#eab308['\"]", "color: '#fde68a'"),
    (r"background:\s*['\"]#fef9c3['\"]", "background: 'rgba(255, 215, 0, 0.15)'"),
    (r"border:\s*['\"]1px solid #fef08a['\"]", "border: '1px solid rgba(255, 215, 0, 0.3)'"),
    (r"background:\s*['\"]#f8fafc['\"]", "background: 'rgba(0, 0, 0, 0.3)'"),
    (r"borderBottom:\s*['\"]1px solid #e2e8f0['\"]", "borderBottom: '1px solid rgba(255, 255, 255, 0.1)'"),
]

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content
            for pattern, repl in replacements:
                new_content = re.sub(pattern, repl, new_content)

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {file}")
