export default function SimHistoryContent() {
	return (
		<div className="flex flex-col gap-6 text-base leading-[1.75] text-[var(--app-text)]">
			<p className="m-0">
				SIM has been an early adopter of Internet technologies and the program has embraced and integrated
				them into the SIM Department curriculum since before the existence of the Web, going back to the
				80&rsquo;s. The first MassArt web server was created as an initiative of Dana Moser and the SIM
				Department in the mid-1990s with student participation in the design process.
			</p>
			<p className="m-0">
				In February 2003, students, Matt Karl and August &ldquo;Kai&rdquo; Kaiser, along with Professor
				Dana Moser, launched the first version of{" "}
				<a
					href="http://sim.massart.edu"
					target="_blank"
					rel="noreferrer"
					className="text-[var(--app-text)] decoration-current underline-offset-[0.14em] hover:text-[var(--brand-color)]"
				>
					http://sim.massart.edu
				</a>
				, a community contact portal with a &ldquo;names and faces&rdquo; or face book tool. It was also
				used to record student presentations and production schedules and share syllabi, calendars,
				research guides, studio management information, discussion boards, and portfolios.
			</p>
			<p className="m-0">
				For historical perspective, &ldquo;The Facebook&rdquo; was launched in February 2004 at Harvard.
			</p>
			<p className="m-0">
				The SIM site was built with an open source software stack (Linux/Apache/MySql/PHP) on commodity
				hardware and had a DNS entry created for it.
			</p>
			<p className="m-0">
				Over the years, alum Matt Karl has continually re-written the interface for the SIM website,
				adapting to the specific needs of our department&rsquo;s faculty and students. Since 2020,
				MassArt alum Anthony Fader and Efe Ozalp have continued to upgrade and optimize the site to fit
				current needs.
			</p>
			<p className="m-0">
				At this point we have a custom-built Content Management System (CMS) that others have used as a
				reference. Our department emphasizes and promotes student participation, and we encourage the
				development of real world solutions to instruct students who are interested in network
				interactions and system administration.
			</p>
			<p className="m-0">
				You can see a history of the development of the SIM site on the Wayback machine &ndash; (
				<a
					href="https://web.archive.org/web/*/sim.massart.edu"
					target="_blank"
					rel="noreferrer"
					className="text-[var(--app-text)] decoration-current underline-offset-[0.14em] hover:text-[var(--brand-color)]"
				>
					https://web.archive.org/web/*/sim.massart.edu
				</a>
				).
			</p>
		</div>
	);
}
