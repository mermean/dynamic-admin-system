import requests


def ask_ai(prompt: str):
    try:
        short_prompt = prompt[:3000]  # çok büyük prompt engelle

        response = requests.post(
            "http://host.docker.internal:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": short_prompt,
                "stream": False
            },
            timeout=20
        )

        data = response.json()

        return data.get(
            "response",
            "AI cevap üretemedi."
        )

    except requests.Timeout:
        return "AI zaman aşımına uğradı (timeout) ❌"

    except Exception as e:
        return f"AI Hatası: {str(e)}"