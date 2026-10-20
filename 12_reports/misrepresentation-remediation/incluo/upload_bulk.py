"""POST bulk-input.jsonl to Shopify staged upload URL."""
import requests
from pathlib import Path

BULK = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\bulk-input.jsonl")

URL = "https://shopify-staged-uploads.storage.googleapis.com/"
PARAMS = [
    ("Content-Type", "text/jsonl"),
    ("success_action_status", "201"),
    ("acl", "private"),
    ("key", "tmp/70841237666/bulk/0a20a198-0bc1-4c80-96c1-910c5d31eade/bulk-input.jsonl"),
    ("x-goog-date", "20260527T234146Z"),
    ("x-goog-credential", "merchant-assets@shopify-tiers.iam.gserviceaccount.com/20260527/auto/storage/goog4_request"),
    ("x-goog-algorithm", "GOOG4-RSA-SHA256"),
    ("x-goog-signature", "787d3be29d3640072015ce76b33c603d079647c773447f36c487ebf7bf7580dacc0c6fc3848656afef255077eabf8432d837c146fa9566aac20dd6ad6f68e8dd11c7a402ab7788f1f9b8e328d26289390f27a2d9ec4ec11a2a66fc1d05da9bcfadbb40e464d789f3b363324a9ffc8133c67e76935f72a000c6b3c388ac8f1facd84d8d530ecff14b805f7f6174a16030708ce44b8156842d4c1a7b11aca5a665f087b61751c6937ea69e9fd2f1611ccf6541e62563331974b26925ad2cb8bd64bbccea1bd845e771dfb3f217b2bea87f1e217ffc02c1b2055ca58fb176a13e713ed26a1b2db6791eb14182f9765731aed8f93e6d0e72a398968c6983acd4528f"),
    ("policy", "eyJjb25kaXRpb25zIjpbeyJDb250ZW50LVR5cGUiOiJ0ZXh0XC9qc29ubCJ9LHsic3VjY2Vzc19hY3Rpb25fc3RhdHVzIjoiMjAxIn0seyJhY2wiOiJwcml2YXRlIn0sWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMSwxMDQ4NTc2MDBdLHsiYnVja2V0Ijoic2hvcGlmeS1zdGFnZWQtdXBsb2FkcyJ9LHsia2V5IjoidG1wXC83MDg0MTIzNzY2NlwvYnVsa1wvMGEyMGExOTgtMGJjMS00YzgwLTk2YzEtOTEwYzVkMzFlYWRlXC9idWxrLWlucHV0Lmpzb25sIn0seyJ4LWdvb2ctZGF0ZSI6IjIwMjYwNTI3VDIzNDE0NloifSx7IngtZ29vZy1jcmVkZW50aWFsIjoibWVyY2hhbnQtYXNzZXRzQHNob3BpZnktdGllcnMuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb21cLzIwMjYwNTI3XC9hdXRvXC9zdG9yYWdlXC9nb29nNF9yZXF1ZXN0In0seyJ4LWdvb2ctYWxnb3JpdGhtIjoiR09PRzQtUlNBLVNIQTI1NiJ9XSwiZXhwaXJhdGlvbiI6IjIwMjYtMDUtMjhUMjM6NDE6NDZaIn0="),
]

files = {"file": BULK.read_bytes()}
data = PARAMS
r = requests.post(URL, data=data, files=files)
print(f"Status: {r.status_code}")
print(f"Headers: {dict(r.headers)}")
print(f"Body (first 500): {r.text[:500]}")
