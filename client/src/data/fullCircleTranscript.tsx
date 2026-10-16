import type { ReactNode } from "react";

// Readable transcript of the "Full Circle" film (landscape cut), grouped by
// chapter. Source: the reviewed captions in
// public/videos/full-circle/full-circle.en.vtt — keep the two in sync.
export const fullCircleTranscriptText: readonly { readonly chapter: string; readonly lines: string }[] = [
  {
    chapter: "Where it started",
    lines:
      "Just keep on building, keep on growing. My dad, he had family friends who were dentists. They’re brothers. They kind of took me under their wing, and when I didn’t really know what I wanted to do, they gave me a job at their office, and I did some assisting and sterilizing instruments. And what I noticed most that I liked was just the team dynamic and the patient relationships that all the staff had. That’s what really drew me into dentistry.",
  },
  {
    chapter: "A second family",
    lines:
      "They walk in, they know who they are. Ask them about their families and whatnot. You could be a kid going to dentists all the way to an adult, and you kind of grow up together. That’s like your work family, your second family. That family is important to me.",
  },
  {
    chapter: "Friends on the journey",
    lines:
      "Friends on that journey, you kind of struggle together. It’s always nice. It’s hard to struggle alone. If you’re gonna struggle, at least you’ll struggle with someone else, and then you help each other out along the way.",
  },
  {
    chapter: "Passing the torch",
    lines:
      "I happened to meet Dr. Hamamoto, the previous practice owner, at a study group. She offered to sell the practice because it was a good fit, personality-wise and dental philosophy-wise, as well. She tells me that my demeanor is similar to her predecessor, Dr. Benson Kanemoto, before her, who she took over the practice from. So this practice does have a lot of history, and a lot of patients are still around, and it’s almost kind of full circle and nice, where the changing of the guard is a smooth transition. She’s like an auntie to me now, and like her nephew. It’s going back to the whole family dynamic.",
  },
  {
    chapter: "Dr. Hamamoto’s blessing",
    lines:
      "That can be scary for patients when someone else new comes in. Just having them get a chance to stay and then getting Kris’s blessing, and then having them just get a chance to meet me, it kind of helps with that fear of the unknown.",
  },
  {
    chapter: "Keep on growing",
    lines:
      "Just making sure the patient experience is still good and consistent on what Dr. Hamamoto built, and kind of building off of that. The staff has been the same staff that she had, and they’ve been great and supportive as well. Can’t do it without them. Just keep on building, keep on growing.",
  },
];

export const fullCircleTranscript: ReactNode = (
  <>
    {fullCircleTranscriptText.map((part) => (
      <div key={part.chapter}>
        <h3 className="font-heading text-lg font-medium">{part.chapter}</h3>
        <p className="mt-1">{part.lines}</p>
      </div>
    ))}
  </>
);
