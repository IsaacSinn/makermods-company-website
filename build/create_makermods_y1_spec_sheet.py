from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image as RLImage,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "build" / "makermods_y1_spec_assets"
OUT = ROOT / "dist" / "MakerMods_Y1_Spec_Sheet.pdf"
TMP = ROOT / "build" / "makermods_y1_spec_assets" / "_prepared"
TMP.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = letter
MARGIN = 0.48 * inch
ACCENT = colors.HexColor("#F36C21")
INK = colors.HexColor("#15171A")
MUTED = colors.HexColor("#59616B")
LINE = colors.HexColor("#DDE3EA")
SOFT = colors.HexColor("#F4F7FA")
GREEN = colors.HexColor("#12A66A")


def prepare_masked_image(name: str, mask_name: str, out_name: str, bg=(255, 255, 255)) -> Path:
    src = Image.open(ASSET_DIR / name).convert("RGB")
    mask = Image.open(ASSET_DIR / mask_name).convert("L")
    if src.size != mask.size:
        mask = mask.resize(src.size)
    rgba = src.convert("RGBA")
    rgba.putalpha(mask)
    canvas = Image.new("RGBA", src.size, bg + (255,))
    canvas.alpha_composite(rgba)
    out = TMP / out_name
    canvas.convert("RGB").save(out, quality=96)
    return out


HERO = prepare_masked_image("img-000.png", "img-001.png", "hero_white.jpg")
IMG_DIRECT_TEACH = ASSET_DIR / "img-010.png"
IMG_TELEOP = ASSET_DIR / "img-011.png"
IMG_TRAJECTORY = ASSET_DIR / "img-017.png"
IMG_BIMANUAL = ASSET_DIR / "img-018.png"
IMG_FOUR_ARM = ASSET_DIR / "img-020.png"
IMG_CLOTH = ASSET_DIR / "img-021.png"
IMG_URDF = ASSET_DIR / "img-012.png"
IMG_SIM = ASSET_DIR / "img-013.png"


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        "Tiny",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=6.8,
        leading=8.2,
        textColor=MUTED,
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.4,
        leading=10.5,
        textColor=INK,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        "BodyMuted",
        parent=styles["Body"],
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        "H1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=25,
        leading=27,
        textColor=INK,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        "H2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=14,
        textColor=INK,
        spaceBefore=6,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        "H3",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=11,
        textColor=INK,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        "Kicker",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=ACCENT,
        uppercase=True,
        spaceAfter=3,
    )
)


def fit_image(path: Path, width: float, max_height: float) -> RLImage:
    with Image.open(path) as im:
        iw, ih = im.size
    scale = min(width / iw, max_height / ih)
    return RLImage(str(path), width=iw * scale, height=ih * scale)


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def table(data, widths, header=True, font_size=7.4, leading=8.4, row_bg=False):
    body_style = ParagraphStyle(
        "Cell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=font_size,
        leading=leading,
        textColor=INK,
    )
    head_style = ParagraphStyle(
        "CellHead",
        parent=body_style,
        fontName="Helvetica-Bold",
        textColor=colors.white,
    )
    rows = []
    for r, row in enumerate(data):
        rows.append([Paragraph(str(c), head_style if header and r == 0 else body_style) for c in row])
    t = Table(rows, colWidths=widths, hAlign="LEFT", repeatRows=1 if header else 0)
    commands = [
        ("BOX", (0, 0), (-1, -1), 0.55, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if header:
        commands.append(("BACKGROUND", (0, 0), (-1, 0), INK))
    if row_bg:
        for r in range(1 if header else 0, len(rows)):
            if r % 2 == 0:
                commands.append(("BACKGROUND", (0, r), (-1, r), SOFT))
    t.setStyle(TableStyle(commands))
    return t


def stats_grid(items, width):
    data = []
    for i in range(0, len(items), 3):
        data.append(items[i : i + 3])
    cells = []
    for row in data:
        out = []
        for label, value in row:
            out.append(
                Paragraph(
                    f'<font name="Helvetica-Bold" size="15">{value}</font><br/>'
                    f'<font color="#59616B" size="7">{label}</font>',
                    styles["Body"],
                )
            )
        while len(out) < 3:
            out.append("")
        cells.append(out)
    t = Table(cells, colWidths=[width / 3] * 3, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.55, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return t


class SpecDoc(BaseDocTemplate):
    def __init__(self, path):
        super().__init__(
            path,
            pagesize=letter,
            leftMargin=MARGIN,
            rightMargin=MARGIN,
            topMargin=0.62 * inch,
            bottomMargin=0.55 * inch,
            title="MakerMods Y1 Spec Sheet",
            author="MakerMods",
            subject="Y1 lightweight six-axis robot arm specifications",
        )
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="normal",
            showBoundary=0,
        )
        self.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=draw_page)])


def draw_page(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(MARGIN, PAGE_H - 0.34 * inch, "MAKERMODS")
    canvas.setFillColor(ACCENT)
    canvas.rect(MARGIN + 70, PAGE_H - 0.29 * inch, 22, 3, stroke=0, fill=1)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.32 * inch, "Y1 Lightweight 6-Axis Robot Arm")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, PAGE_H - 0.46 * inch, PAGE_W - MARGIN, PAGE_H - 0.46 * inch)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawRightString(PAGE_W - MARGIN, 0.32 * inch, f"MakerMods Y1 Spec Sheet / {page}")
    canvas.restoreState()


def image_pair(left, right, width, height, cap_left, cap_right):
    each = (width - 8) / 2
    return KeepTogether(
        [
            Table(
                [
                    [fit_image(left, each, height), fit_image(right, each, height)],
                    [p(cap_left, "Tiny"), p(cap_right, "Tiny")],
                ],
                colWidths=[each, each],
                hAlign="LEFT",
            )
        ]
    )


def branded_callout(title, body):
    return Table(
        [[p(title, "H3")], [p(body, "BodyMuted")]],
        colWidths=[doc_width],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF5EF")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#F8C9AE")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        ),
    )


doc_width = PAGE_W - 2 * MARGIN
doc = SpecDoc(str(OUT))
story = []

story.append(p("PRODUCT SPECIFICATION", "Kicker"))
story.append(p("Y1 Lightweight 6-Axis Robot Arm", "H1"))
story.append(
    p(
        "A compact, research-ready robotic arm for embodied AI, education, "
        "robotics labs, data collection, and light-duty automation workflows.",
        "BodyMuted",
    )
)
story.append(Spacer(1, 5))
story.append(fit_image(HERO, doc_width, 3.05 * inch))
story.append(Spacer(1, 8))
story.append(
    stats_grid(
        [
            ("Rated payload", "3 kg"),
            ("Reach", "612.5 mm"),
            ("Repeatability", "+/-0.1 mm"),
            ("Degrees of freedom", "6"),
            ("Arm weight", "4.2 kg"),
            ("Supply voltage", "24 V"),
        ],
        doc_width,
    )
)
story.append(Spacer(1, 9))
story.append(
    branded_callout(
        "Designed for fast lab deployment",
        "The Y1 combines a lightweight six-axis structure, modular end tooling, "
        "open robot descriptions, simulation support, and SDK access for quick "
        "transition from experiment setup to real-arm testing.",
    )
)
story.append(Spacer(1, 8))
story.append(
    table(
        [
            ["Highlights", "Details"],
            ["Compact mechanics", "Six-axis arm with small base footprint for benches, classrooms, and robotics cells."],
            ["Modular end tools", "Compatible with gripper, teach pendant, and combined gripper/teaching end effector."],
            ["Precise motion", "Joint control and end-pose control with stable inverse-kinematics solving."],
            ["Embodied AI workflow", "Supports gravity-compensated teaching, trajectory replay, simulation, and dataset collection."],
        ],
        [1.45 * inch, doc_width - 1.45 * inch],
        row_bg=True,
    )
)
story.append(PageBreak())

story.append(p("HARDWARE", "Kicker"))
story.append(p("Mechanical And Electrical Specifications", "H1"))
story.append(
    table(
        [
            ["Parameter", "Specification", "Parameter", "Specification"],
            ["Arm weight", "4.2 kg", "Rated payload", "3 kg"],
            ["Degrees of freedom", "6", "Working radius", "612.5 mm"],
            ["Repeatability", "+/-0.1 mm", "Supply voltage", "24 V"],
            ["Controller", "PC", "Communication", "CAN"],
            ["External interface", "Power + CAN, XT30 2+2", "Control modes", "Trajectory tracking, teaching, API"],
            ["Base mounting", "90 x 90 mm, M5 x 4", "Materials", "Aluminum alloy, resin"],
        ],
        [1.18 * inch, 1.86 * inch, 1.18 * inch, 1.86 * inch],
        row_bg=True,
    )
)
story.append(Spacer(1, 8))
story.append(p("Joint Travel And Maximum Speed", "H2"))
story.append(
    table(
        [
            ["Joint", "Motion range", "Max speed"],
            ["J1", "-165 to 165 deg", "180 deg/s"],
            ["J2", "-180 to 0 deg", "180 deg/s"],
            ["J3", "0 to 180 deg", "180 deg/s"],
            ["J4", "-95 to 86 deg", "220 deg/s"],
            ["J5", "-90 to 90 deg", "220 deg/s"],
            ["J6", "-150 to 150 deg", "220 deg/s"],
        ],
        [1.2 * inch, 2.05 * inch, 2.05 * inch],
        row_bg=True,
    )
)
story.append(Spacer(1, 8))
story.append(p("Supported End Tools", "H2"))
story.append(
    table(
        [
            ["Tool", "Weight", "Size", "Stroke", "Repeatability", "Interface"],
            ["Y1-G gripper", "670 g", "170 x 67 x 167.5 mm", "0-95 mm", "+/-0.1 mm", "Power + CAN, XT30 2+2"],
            ["Y1-T teach pendant", "670 g", "170 x 175 x 90 mm", "0-95 mm", "+/-0.1 mm", "Power + CAN, XT30 2+2"],
            ["Y1-GT gripper + teach tool", "670 g", "170 x 175 x 167.5 mm", "0-95 mm", "+/-0.1 mm", "Power + CAN, XT30 2+2"],
        ],
        [1.25 * inch, 0.68 * inch, 1.35 * inch, 0.72 * inch, 0.84 * inch, 1.31 * inch],
        row_bg=True,
        font_size=6.85,
        leading=7.8,
    )
)
story.append(Spacer(1, 9))
story.append(image_pair(IMG_DIRECT_TEACH, IMG_TELEOP, doc_width, 1.75 * inch, "Gravity-compensated direct teaching", "Single leader-follower teleoperation"))
story.append(PageBreak())

story.append(p("SOFTWARE", "Kicker"))
story.append(p("Control, Simulation, And SDK Support", "H1"))
story.append(
    table(
        [
            ["Capability", "English specification"],
            ["Joint and end-pose control", "Precise joint position control and Cartesian end-pose control with stable IK solving."],
            ["Gravity compensation", "Reduced operator effort during teaching and dataset collection."],
            ["Trajectory tracking", "Adaptive trajectory-following control to reproduce collected motion paths smoothly."],
            ["Robot description files", "URDF files for the arm and for assemblies with supported end tools."],
            ["Simulation", "Compatible with MoveIt and Gazebo for planning, visualization, and real-arm co-debugging."],
            ["Operating systems", "Ubuntu 20.04 and Ubuntu 22.04."],
            ["ROS support", "ROS1 Noetic and ROS2 Humble."],
            ["SDK languages", "Python and C++ SDK interfaces for application development and integration."],
        ],
        [1.55 * inch, doc_width - 1.55 * inch],
        row_bg=True,
    )
)
story.append(Spacer(1, 8))
story.append(image_pair(IMG_URDF, IMG_SIM, doc_width, 1.65 * inch, "URDF-based visualization", "MoveIt and Gazebo simulation workflow"))
story.append(Spacer(1, 8))
story.append(p("Data Collection Modes", "H2"))
story.append(
    table(
        [
            ["Mode", "Hardware configuration", "Operator workflow"],
            ["Single-arm direct collection", "Y1 arm x 1 + Y1-GT x 1", "Operator holds the combined end effector and directly demonstrates the task."],
            ["Single leader + single follower", "Y1 arm x 2 + Y1-T x 1 + Y1-G x 1", "Operator controls the follower arm through the leader arm teach pendant."],
            ["Dual-arm direct collection", "Y1 arm x 2 + Y1-GT x 2", "Operator uses both hands to directly demonstrate bimanual tasks."],
            ["Dual leader + dual follower", "Y1 arm x 4 + Y1-T x 2 + Y1-G x 2", "Operator remotely controls paired follower arms for bimanual data collection."],
        ],
        [1.35 * inch, 2.15 * inch, doc_width - 3.5 * inch],
        row_bg=True,
        font_size=6.95,
        leading=8,
    )
)
story.append(PageBreak())

story.append(p("APPLICATIONS", "Kicker"))
story.append(p("Embodied AI And Robotics Workflows", "H1"))
story.append(
    p(
        "The Y1 is suited for instruction, robotics research, imitation-learning "
        "data collection, manipulation experiments, and proof-of-concept light "
        "automation. The open software stack supports development from simulation "
        "to physical deployment.",
        "BodyMuted",
    )
)
story.append(Spacer(1, 7))
story.append(image_pair(IMG_TRAJECTORY, IMG_BIMANUAL, doc_width, 1.7 * inch, "Human-guided trajectory capture", "Dual-arm task demonstration"))
story.append(Spacer(1, 7))
story.append(image_pair(IMG_FOUR_ARM, IMG_CLOTH, doc_width, 1.7 * inch, "Multi-arm leader-follower setup", "Bimanual manipulation example"))
story.append(Spacer(1, 8))
story.append(p("Learning And Model Development", "H2"))
story.append(
    table(
        [
            ["Area", "Support"],
            ["Dataset capture", "Configurable collection for single-arm and dual-arm manipulation tasks."],
            ["Sensor expansion", "Can be adapted to different camera models and extended to image, depth, and other task data."],
            ["Imitation learning", "Workflow supports reproduction-oriented training and inference experiments such as ACT-style policies."],
            ["VLA experimentation", "Prepared for embodied AI/VLA learning workflows such as pi0/pi0.5-style research pipelines."],
            ["Technical support", "MakerMods provides documentation, case references, integration support, and customization services."],
        ],
        [1.45 * inch, doc_width - 1.45 * inch],
        row_bg=True,
    )
)
story.append(Spacer(1, 8))
story.append(
    branded_callout(
        "Package note",
        "Standard packaging is organized for fast setup. Final package contents depend on the purchased configuration and selected end tools.",
    )
)

doc.build(story)
print(OUT)
