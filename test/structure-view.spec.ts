import { beforeAll, describe, test } from "vitest";
import { LikeC4 } from "likec4";

/**
 * Types are derived from the LikeC4 API so they track upstream changes
 * without us having to restate them. `ComputedModel` is the return type of
 * `LikeC4.fromWorkspace(...).computedModel()`; `ModelElement` and
 * `ModelRelationship` are inferred from the methods we call on it.
 */
type ComputedModel = Awaited<
  ReturnType<Awaited<ReturnType<typeof LikeC4.fromWorkspace>>["computedModel"]>
>;
type ModelElement = ReturnType<ComputedModel["elements"]> extends Iterable<infer T>
  ? T
  : never;
type ModelRelationship = ReturnType<ComputedModel["relationships"]> extends Iterable<infer T>
  ? T
  : never;

let technicalViewModel: ComputedModel;
const USER_KINDS = new Set(["actor", "externalActor"]);
const EXCLUDED_RELATIONSHIP_KINDS = new Set(["legacyRelationship", "futureRelationship"]);

const normalize = (value: unknown): string =>
  String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
const isCurrentElement = (element: ModelElement): boolean =>
  !element.tags.includes("future");
const isCurrentRelationship = (relationship: ModelRelationship): boolean =>
  !EXCLUDED_RELATIONSHIP_KINDS.has(relationship.kind) &&
  !USER_KINDS.has(relationship.source.kind) &&
  !USER_KINDS.has(relationship.target.kind) &&
  isCurrentElement(relationship.source) &&
  isCurrentElement(relationship.target);

beforeAll(async () => {
  technicalViewModel = await (
    await LikeC4.fromWorkspace("technology/current-state-views/structure-view")
  ).computedModel();
});

describe("structure-view LikeC4 model", () => {
  describe("elements", () => {
    test("core element kinds include description and technology", ({ expect }) => {
      expect.hasAssertions();
      const kinds = ["frontend", "backend", "component", "storage", "queue"];
      for (const kind of kinds) {
        for (const element of technicalViewModel.elementsOfKind(kind)) {
          expect.soft(
            element.description?.nonEmpty,
            `${element.id} (${kind}) should include a description`,
          ).toBe(true);
          expect.soft(
            Boolean(element.technology),
            `${element.id} (${kind}) should include technology`,
          ).toBe(true);
        }
      }
    });

    test("current frontends/backends include a GitHub source link", ({
      expect,
    }) => {
      expect.hasAssertions();
      const kinds = ["frontend", "backend"];
      for (const kind of kinds) {
        for (const element of technicalViewModel.elementsOfKind(kind)) {
          if (!isCurrentElement(element)) {
            continue;
          }
          const hasGithubLinkInLinks = (element.links ?? []).some((link) =>
            /^https?:\/\/github\.com\//i.test(link.url),
          );
          const githubMetadata = element.getMetadata?.("github");
          const hasGithubLinkInMetadata =
            typeof githubMetadata === "string" &&
            /^https?:\/\/github\.com\//i.test(githubMetadata);
          expect.soft(
            hasGithubLinkInLinks || hasGithubLinkInMetadata,
            `${element.id} (${kind}) should include a GitHub repository link`,
          ).toBe(true);
        }
      }
    });

    test("if tech icon and technology are both set, values should match", ({
      expect,
    }) => {
      expect.hasAssertions();
      for (const element of technicalViewModel.elements()) {
        const hasIcon = Boolean(element.icon);
        const hasTechnology = Boolean(element.technology);
        if (!(hasIcon && hasTechnology)) {
          continue;
        }
        const iconValue = String(element.icon);
        const techValue = String(element.technology);
        if (!iconValue.startsWith("tech:")) {
          continue;
        }
        const inferredFromIcon = iconValue.split(":")[1];
        const normalizedInferred = normalize(inferredFromIcon);
        const normalizedTech = normalize(techValue);

        const matches =
          normalizedTech === normalizedInferred ||
          normalizedTech.includes(normalizedInferred) ||
          normalizedInferred.includes(normalizedTech);
        expect.soft(
          matches,
          `${element.id} uses tech icon "${iconValue}"; remove explicit technology "${techValue}" (inferred from icon)`,
        ).toBe(true);
      }
    });
  });

  describe("relationships", () => {
    test("all relationships include a readable title", ({ expect }) => {
      expect.hasAssertions();
      for (const relationship of technicalViewModel.relationships()) {
        expect.soft(
          Boolean(relationship.title),
          `${relationship.source.id} -> ${relationship.target.id} should include a title`,
        ).toBe(true);
      }
    });

    test("current non-user relationships include technology", ({
      expect,
    }) => {
      expect.hasAssertions();
      for (const relationship of technicalViewModel.relationships()) {
        if (!isCurrentRelationship(relationship)) {
          continue;
        }
        expect.soft(
          Boolean(relationship.technology),
          `${relationship.source.id} -> ${relationship.target.id} should include technology`,
        ).toBe(true);
      }
    });

    test("legacy/future relationship kinds connect to matching tagged elements", ({
      expect,
    }) => {
      expect.hasAssertions();
      for (const relationship of technicalViewModel.relationships()) {
        if (!EXCLUDED_RELATIONSHIP_KINDS.has(relationship.kind)) {
          continue;
        }
        const requiredTag =
          relationship.kind === "legacyRelationship" ? "legacy" : "future";
        const sourceHasTag = relationship.source.tags.includes(requiredTag);
        const targetHasTag = relationship.target.tags.includes(requiredTag);
        expect.soft(
          sourceHasTag || targetHasTag,
          `${relationship.source.id} -> ${relationship.target.id} (${relationship.kind}) should involve a #${requiredTag} element`,
        ).toBe(true);
      }
    });

    test("relationships between two same-lifecycle elements use the matching kind", ({
      expect,
    }) => {
      expect.hasAssertions();
      const lifecycleKindByTag: Record<string, string> = {
        future: "futureRelationship",
        legacy: "legacyRelationship",
      };
      for (const relationship of technicalViewModel.relationships()) {
        for (const [tag, expectedKind] of Object.entries(lifecycleKindByTag)) {
          if (
            !relationship.source.tags.includes(tag) ||
            !relationship.target.tags.includes(tag)
          ) {
            continue;
          }
          expect.soft(
            relationship.kind,
            `${relationship.source.id} -> ${relationship.target.id}: both endpoints are #${tag}, so the relationship should use .${expectedKind} (got .${relationship.kind})`,
          ).toBe(expectedKind);
        }
      }
    });
  });

  describe("views", () => {
    test("at least one view is defined", ({ expect }) => {
      const viewIds = [...technicalViewModel.views()].map((view) => view.id);
      expect(viewIds.length, "structure-view should define at least one view").toBeGreaterThan(0);
    });

    test("dynamic-view steps have same-direction same-element static backing", ({
      expect,
    }) => {
      expect.hasAssertions();
      for (const view of technicalViewModel.views()) {
        if (!view.isDynamicView()) {
          continue;
        }
        for (const edge of view.edges()) {
          const backing = [...edge.relationships("model")];
          expect.soft(
            backing.length,
            `dynamic view "${view.id}": step ${edge.source.id} -> ${edge.target.id} ("${edge.label ?? ""}") has no same-direction same-element static backing; the arrow will render unstyled`,
          ).toBeGreaterThan(0);
        }
      }
    });
  });
});
