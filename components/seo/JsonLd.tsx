/** Renders a schema.org object as a JSON-LD <script> tag. `data` is always
 * our own server-constructed object (never user input), so the serialized
 * JSON is safe to inline directly. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
