import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default function AllowStyleTags(editor) {
  console.log(editor);
  editor.model.schema.register("style", {
    allowWhere: "$block",
    allowContentOf: "$root",
  });
  editor.model.schema.addAttributeCheck((context) => {
    if (context.endsWith("style")) {
      return true;
    }
  });

  // The view-to-model converter converting a view <style> with all its attributes to the model.
  editor.conversion.for("upcast").elementToElement({
    view: "style",
    model: (viewElement, { writer: modelWriter }) => {
      return modelWriter.createElement("style", viewElement.getAttributes());
    },
  });

  // The model-to-view converter for the <style> element (attributes are converted separately).
  editor.conversion.for("downcast").elementToElement({
    model: "style",
    view: "style",
  });

  // The model-to-view converter for <style> attributes.
  // Note that a lower-level, event-based API is used here.
  editor.conversion.for("downcast").add((dispatcher) => {
    dispatcher.on("attribute", (evt, data, conversionApi) => {
      // Convert <style> attributes only.
      if (data.item.name != "style") {
        return;
      }

      const viewWriter = conversionApi.writer;
      const viewStyle = conversionApi.mapper.toViewElement(data.item);

      // In the model-to-view conversion we convert changes.
      // An attribute can be added or removed or changed.
      // The below code handles all 3 cases.
      if (data.attributeNewValue) {
        viewWriter.setAttribute(
          data.attributeKey,
          data.attributeNewValue,
          viewStyle
        );
      } else {
        viewWriter.removeAttribute(data.attributeKey, viewStyle);
      }
    });
  });
}
