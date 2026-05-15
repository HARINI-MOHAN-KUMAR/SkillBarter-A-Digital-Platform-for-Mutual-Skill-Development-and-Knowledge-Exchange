import os
import re

directory = "c:/Users/mhari/OneDrive/Desktop/mini_project_college/frontend/src"

replacements = [
    (r"color:\s*['\"]#e2e8f0['\"]", "color: '#1e293b'"),
    (r"color:\s*['\"]rgba\(255,\s*255,\s*255,\s*0\.4\)['\"]", "color: '#64748b'"),
    (r"color:\s*['\"]rgba\(255,\s*255,\s*255,\s*0\.5\)['\"]", "color: '#64748b'"),
    (r"color:\s*['\"]rgba\(255,\s*255,\s*255,\s*0\.7\)['\"]", "color: '#475569'"),
    (r"background:\s*['\"]rgba\(255,\s*255,\s*255,\s*0\.1\)['\"]", "background: '#f1f5f9'"),
    (r"background:\s*['\"]rgba\(255,\s*255,\s*255,\s*0\.05\)['\"]", "background: '#ffffff'"),
    (r"border:\s*['\"]1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)['\"]", "border: '1px solid #e2e8f0'"),
    (r"border:\s*['\"]1px solid rgba\(255,\s*255,\s*255,\s*0\.2\)['\"]", "border: '1px solid #cbd5e1'"),
    (r"background:\s*['\"]rgba\(108,\s*99,\s*255,\s*0\.1\)['\"]", "background: '#eff6ff'"),
    (r"border:\s*['\"]1px solid rgba\(108,\s*99,\s*255,\s*0\.2\)['\"]", "border: '1px solid #bfdbfe'"),
    (r"background:\s*['\"]rgba\(239,\s*68,\s*68,\s*0\.15\)['\"]", "background: '#fee2e2'"),
    (r"border:\s*['\"]1px solid rgba\(239,\s*68,\s*68,\s*0\.3\)['\"]", "border: '1px solid #fecaca'"),
    (r"color:\s*['\"]#fc8181['\"]", "color: '#ef4444'"),
    (r"background:\s*['\"]rgba\(74,\s*222,\s*128,\s*0\.15\)['\"]", "background: '#dcfce3'"),
    (r"border:\s*['\"]1px solid rgba\(74,\s*222,\s*128,\s*0\.3\)['\"]", "border: '1px solid #bbf7d0'"),
    (r"color:\s*['\"]#4ade80['\"]", "color: '#16a34a'"),
    (r"color:\s*['\"]#a5b4fc['\"]", "color: '#4338ca'"),
    (r"color:\s*['\"]#fde68a['\"]", "color: '#eab308'"),
    (r"background:\s*['\"]rgba\(255,\s*215,\s*0,\s*0\.15\)['\"]", "background: '#fef9c3'"),
    (r"border:\s*['\"]1px solid rgba\(255,\s*215,\s*0,\s*0\.3\)['\"]", "border: '1px solid #fef08a'"),
    (r"background:\s*['\"]rgba\(0,\s*0,\s*0,\s*0\.3\)['\"]", "background: '#f8fafc'"),
    (r"background:\s*['\"]rgba\(0,\s*0,\s*0,\s*0\.2\)['\"]", "background: '#f1f5f9'"),
    (r"borderBottom:\s*['\"]1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)['\"]", "borderBottom: '1px solid #e2e8f0'"),
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
